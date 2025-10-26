import * as modlib from 'modlib';

const DEV_BUILD = {
    ENABLED: false,
    BOTS: 1,
    SPAWNER_ID: 101
}

const INFECTION_CFG = {
    GAMEMODE: {
        MINIMUM_PLAYERS: 2,
        INITIAL_INFECTED_COUNT: 1,
        NUM_OF_ROUNDS: 5,
        PRE_ROUND_SECONDS: 5,
        COUNTDOWN_SECONDS: 10,
        ROUND_SECONDS: 300,
        ROUND_END_SECONDS: 15
    },
    LOADOUTS: {
        ALLOWED_WEAPONS_INFECTED: [],
        ALLOWED_GADGETS_INFECTED: [
            mod.Gadgets.Melee_Combat_Knife,
            mod.Gadgets.Throwable_Throwing_Knife
        ],
        ALLOWED_WEAPONS_SURVIVORS: [
            mod.Weapons.Shotgun_M1014
        ],
        ALLOWED_GADGETS_SURVIVORS: [
            mod.Gadgets.Melee_Combat_Knife
        ],
        NUM_INFECTED_THROWING_KNIVES: 3
    }
}

enum InfectedTeam {
    SURVIVORS = 1,
    INFECTED = 2
}

enum MatchStatus {
    LOBBY,
    PRE_ROUND,
    COUNTDOWN,
    IN_PROGRESS,
    ROUND_END,
    GAME_END
}

export async function OnGameModeStarted() {
    mod.EnableAllPlayerDeploy(false)
    gameState.initGameState();
}

export async function OnPlayerJoinGame(eventPlayer: mod.Player) {
    gameState.initializePlayer(eventPlayer)
}

export function OnSpawnerSpawned(eventPlayer: mod.Player, eventSpawner: mod.Spawner) {
    gameState.initializePlayer(eventPlayer)
    console.log(`Spawned bot ${mod.GetObjId(eventPlayer)}`)
}

export function OnPlayerLeaveGame(eventNumber: number) {
    const pId = eventNumber;
    gameState.players.delete(pId);

    logger.log(`Player ${pId} left!`)
}

export async function OnPlayerDeployed(eventPlayer: mod.Player) {
    const p = gameState.players.get(mod.GetObjId(eventPlayer));
    if (!p) return;

    p.isDeployed = true;

    LoadoutManager.giveLoadout(p)

    logger.log(`Player ${mod.GetObjId(eventPlayer)} deployed`)
}

export function OnPlayerUndeploy(eventPlayer: mod.Player) {
    const p = gameState.players.get(mod.GetObjId(eventPlayer));
    if (p) p.isDeployed = false;

    logger.log(`Player ${p?.playerId} undeployed!`)
}

export async function OnPlayerDied(victimP: mod.Player, killerP: mod.Player) {
    const victim = gameState.players.get(mod.GetObjId(victimP));
    const killer = gameState.players.get(mod.GetObjId(killerP));
    if (!victim || !killer) return;

    await mod.Wait(2);

    if (gameState.matchStatus === MatchStatus.IN_PROGRESS && victim.team === InfectedTeam.SURVIVORS) {
        victim.becomeInfected();
    }

    logger.log(`Player ${victim.playerId} died!`)
}

export function OnMandown(eventPlayer: mod.Player, eventOtherPlayer: mod.Player) { }

export function OnPlayerEarnedKill(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
) {
    const killerId = mod.GetObjId(eventPlayer);
    const victimId = mod.GetObjId(eventOtherPlayer);

    if (killerId === victimId) return;

    const killer = gameState.players.get(killerId)
    if (!killer) return;
    killer.eliminations++

    logger.log(`Player ${killerId} earned a kill on Player ${victimId}.`);
}

class InfectionPlayer {
    player: mod.Player;
    playerId: number;
    team: InfectedTeam = InfectedTeam.SURVIVORS
    perks: any;
    isDeployed: boolean = false;
    movementDisabled: boolean = false;
    eliminations: number = 0;

    constructor(eventPlayer: mod.Player) {
        this.player = eventPlayer;
        this.playerId = mod.GetObjId(eventPlayer);
        this.perks = { survivor: {}, infected: {} };
        mod.SetRedeployTime(eventPlayer, 0);
        gameState.players.set(this.playerId, this);
        this.restrictLoadouts();
    }

    get maxHealth() {
        return mod.GetSoldierState(this.player, mod.SoldierStateNumber.MaxHealth)
    }

    get currentHealth() {
        return mod.GetSoldierState(this.player, mod.SoldierStateNumber.CurrentHealth)
    }

    get isAlive(): boolean {
        return mod.GetSoldierState(this.player, mod.SoldierStateBool.IsAlive)
    }

    get isAIPlayer(): boolean {
        return mod.GetSoldierState(this.player, mod.SoldierStateBool.IsAISoldier)
    }

    async restrictLoadouts() {
        while (true) {
            await mod.Wait(1);
            if (!gameState.gameStarted) continue;
            if (mod.IsPlayerValid(this.player)) continue;

            LoadoutManager.restrictWeapons(this)
            LoadoutManager.restrictGadgets(this)
        }
    }

    async becomeInfected() {
        this.team = InfectedTeam.INFECTED;

        if (this.isDeployed) {
            mod.UndeployPlayer(this.player)
            await mod.Wait(0.5)
        }

        if (mod.GetObjId(mod.GetTeam(this.player)) !== this.team) {
            mod.SetTeam(this.player, mod.GetTeam(this.team))
        }

        gameState.infected.set(this.playerId, this);
        gameState.survivors.delete(this.playerId);

        // mod.DeployPlayer(this.player)

        logger.log(`Player ${this.playerId} initialized as Infected!`)
    }

    async becomeSurvivor() {
        this.team = InfectedTeam.SURVIVORS;

        if (this.isDeployed) {
            mod.UndeployPlayer(this.player)
            await mod.Wait(0.5)
        }

        if (mod.GetObjId(mod.GetTeam(this.player)) !== this.team) {
            mod.SetTeam(this.player, mod.GetTeam(this.team))
        }

        gameState.survivors.set(this.playerId, this);
        gameState.infected.delete(this.playerId);

        // mod.DeployPlayer(this.player)
        // mod.SetPlayerMovementSpeedMultiplier(this.player, 1.1)

        logger.log(`Player ${this.playerId} initialized as Survivor!`)
    }
}

class LoadoutManager {
    static allowedWeaponsInfected: mod.Weapons[] = INFECTION_CFG.LOADOUTS.ALLOWED_WEAPONS_INFECTED;
    static allowedGadgetsInfected: mod.Gadgets[] = INFECTION_CFG.LOADOUTS.ALLOWED_GADGETS_INFECTED
    static allowedWeaponsSurvivors: mod.Weapons[] = INFECTION_CFG.LOADOUTS.ALLOWED_WEAPONS_SURVIVORS
    static allowedGadgetsSurvivors: mod.Gadgets[] = INFECTION_CFG.LOADOUTS.ALLOWED_GADGETS_SURVIVORS
    static infectedThrowableKnives: number = INFECTION_CFG.LOADOUTS.NUM_INFECTED_THROWING_KNIVES - 1

    private static enumValues<E extends Record<string, string | number>>(e: E): (E[keyof E])[] {
        return Object.values(e).filter((v) => typeof v === "number") as (E[keyof E])[];
    }

    static restrictWeapons(player: InfectionPlayer) {
        const allWeapons = this.enumValues(mod.Weapons);
        const allowed = player.team === InfectedTeam.INFECTED
            ? this.allowedWeaponsInfected
            : this.allowedWeaponsSurvivors;

        for (const weapon of allWeapons) {
            const has = mod.HasEquipment(player.player, weapon);
            if (has && !allowed.includes(weapon)) {
                mod.RemoveEquipment(player.player, weapon);
                logger.log(`Removed ${mod.Weapons[weapon]} from ${player.playerId}`);
            }
        }
    }

    static restrictGadgets(player: InfectionPlayer) {
        const allGadgets = this.enumValues(mod.Gadgets);
        const allowed = player.team === InfectedTeam.INFECTED
            ? this.allowedGadgetsInfected
            : this.allowedGadgetsSurvivors;

        for (const gadget of allGadgets) {
            const has = mod.HasEquipment(player.player, gadget);
            if (has && !allowed.includes(gadget)) {
                mod.RemoveEquipment(player.player, gadget);
                logger.log(`Removed ${mod.Gadgets[gadget]} from ${player.playerId}`);
            }
        }
    }

    static giveLoadout(player: InfectionPlayer) {
        if (player.team === InfectedTeam.INFECTED) {
            mod.AddEquipment(player.player, mod.Gadgets.Melee_Combat_Knife);
            mod.AddEquipment(player.player, mod.Gadgets.Throwable_Throwing_Knife);
            mod.SetInventoryAmmo(player.player, mod.InventorySlots.Throwable, LoadoutManager.infectedThrowableKnives)
        } else {
            mod.AddEquipment(player.player, mod.Weapons.Shotgun_M1014);
            mod.AddEquipment(player.player, mod.Gadgets.Melee_Combat_Knife);
        }

        logger.log(`Gave ${player.team === InfectedTeam.INFECTED ? "Infected" : "Survivor"} loadout to ${player.playerId}`);
    }
}

class ScoreboardManager {

}

class BFI_UIInfectedCount {
    countWidget: mod.UIWidget | undefined;
    survivorTextWidget: mod.UIWidget | undefined;
    infectedTextWidget: mod.UIWidget | undefined;

    constructor() {
        const survivorsTextName = `Survivors_Text`;
        const infectedTextName = `Infected_Text`;

        this.countWidget = modlib.ParseUI(
            {
                name: 'infected_count_ui',
                type: "Container",
                position: [-40, 300],
                size: [260, 100],
                anchor: mod.UIAnchor.BottomLeft,
                visible: true,
                padding: 0,
                bgColor: [0.2118, 0.2235, 0.2353],
                bgAlpha: 0,
                bgFill: mod.UIBgFill.None,
                children: [
                    {
                        name: "Container_s",
                        type: "Container",
                        position: [0, 0],
                        size: [260, 50],
                        anchor: mod.UIAnchor.TopLeft,
                        visible: true,
                        padding: 0,
                        bgColor: [0.2, 0.2, 0.2],
                        bgAlpha: 1,
                        bgFill: mod.UIBgFill.None,
                        children: [
                            {
                                name: "sIcon",
                                type: "Image",
                                position: [160, 0],
                                size: [30, 30],
                                anchor: mod.UIAnchor.CenterRight,
                                visible: true,
                                padding: 0,
                                bgColor: [0.2, 0.2, 0.2],
                                bgAlpha: 1,
                                bgFill: mod.UIBgFill.None,
                                imageType: mod.UIImageType.CrownSolid,
                                imageColor: [0.4392, 0.9216, 1],
                                imageAlpha: 0.75
                            },
                            {
                                name: survivorsTextName,
                                type: "Text",
                                position: [0, 0],
                                size: [160, 50],
                                anchor: mod.UIAnchor.CenterRight,
                                visible: true,
                                padding: 8,
                                bgColor: [0.2, 0.2, 0.2],
                                bgAlpha: 1,
                                bgFill: mod.UIBgFill.None,
                                textLabel: mod.Message(mod.stringkeys.SurvivorCount, 0),
                                textColor: [1, 1, 1],
                                textAlpha: 1,
                                textSize: 24,
                                textAnchor: mod.UIAnchor.CenterLeft
                            }
                        ]
                    },
                    {
                        name: "Container_1FIHT",
                        type: "Container",
                        position: [0, 50],
                        size: [260, 50],
                        anchor: mod.UIAnchor.TopLeft,
                        visible: true,
                        padding: 0,
                        bgColor: [0.2, 0.2, 0.2],
                        bgAlpha: 1,
                        bgFill: mod.UIBgFill.None,
                        children: [
                            {
                                name: "Image_z",
                                type: "Image",
                                position: [160, 0],
                                size: [30, 30],
                                anchor: mod.UIAnchor.CenterRight,
                                visible: true,
                                padding: 0,
                                bgColor: [0.2, 0.2, 0.2],
                                bgAlpha: 1,
                                bgFill: mod.UIBgFill.None,
                                imageType: mod.UIImageType.SelfHeal,
                                imageColor: [1, 0.5137, 0.3804],
                                imageAlpha: 0.75
                            },
                            {
                                name: infectedTextName,
                                type: "Text",
                                position: [0, 0],
                                size: [160, 50],
                                anchor: mod.UIAnchor.CenterRight,
                                visible: true,
                                padding: 8,
                                bgColor: [0.2, 0.2, 0.2],
                                bgAlpha: 1,
                                bgFill: mod.UIBgFill.None,
                                textLabel: mod.Message(mod.stringkeys.InfectedCount, 0),
                                textColor: [1, 1, 1],
                                textAlpha: 1,
                                textSize: 24,
                                textAnchor: mod.UIAnchor.CenterLeft
                            }
                        ]
                    }
                ]
            }
        );

        this.survivorTextWidget = mod.FindUIWidgetWithName(survivorsTextName);
        this.infectedTextWidget = mod.FindUIWidgetWithName(infectedTextName);
    }

    Delete() {
        this.countWidget && mod.DeleteUIWidget(this.countWidget)
    }

    Open() {
        this.countWidget && mod.SetUIWidgetVisible(this.countWidget, true)
    }

    Update(survivorCount: number, infectedCount: number) {

        if (this.survivorTextWidget && survivorCount !== undefined) {
            mod.SetUITextLabel(this.survivorTextWidget, mod.Message(mod.stringkeys.SurvivorCount, survivorCount));
        }
        if (this.infectedTextWidget && infectedCount !== undefined) {
            mod.SetUITextLabel(this.infectedTextWidget, mod.Message(mod.stringkeys.InfectedCount, infectedCount));
        }
    }

    async Close(delayclose: number = 0) {
        await mod.Wait(delayclose)
        this.countWidget && mod.SetUIWidgetVisible(this.countWidget, false)
    }
}

class BFI_UIMatchTimer {
    timerWidget: mod.UIWidget | undefined;
    timerTextWidget: mod.UIWidget | undefined;

    constructor() {
        const timerTextName = `Timer_Text`;

        this.timerWidget = modlib.ParseUI(
            {
                name: "Container_YWOK1",
                type: "Container",
                position: [0, 50],
                size: [100, 50],
                anchor: mod.UIAnchor.TopCenter,
                visible: true,
                padding: 0,
                bgColor: [0.2118, 0.2235, 0.2353],
                bgAlpha: 1,
                bgFill: mod.UIBgFill.Blur,
                children: [
                    {
                        name: timerTextName,
                        type: "Text",
                        position: [0, 0],
                        size: [100, 50],
                        anchor: mod.UIAnchor.Center,
                        visible: true,
                        padding: 0,
                        bgColor: [0.2, 0.2, 0.2],
                        bgAlpha: 1,
                        bgFill: mod.UIBgFill.None,
                        textLabel: mod.Message(mod.stringkeys.InfectedTimer0m0s, 0, 0),
                        textColor: [1, 1, 1],
                        textAlpha: 1,
                        textSize: 36,
                        textAnchor: mod.UIAnchor.Center
                    }
                ]
            }
        );

        this.timerTextWidget = mod.FindUIWidgetWithName(timerTextName);
    }

    calcMinutes(): number {
        let elapsed = mod.GetMatchTimeElapsed() - gameState.pointInTime;    // 65 - 60 = 5
        let remaining = Math.max(0, gameState.phaseSeconds - elapsed);      // 180 - 5 = 175
        return Math.floor(remaining / 60);                                  // 175 / 60 = =2.x -> 2
    }

    calcSeconds(): number {
        let elapsed = mod.GetMatchTimeElapsed() - gameState.pointInTime;  // 65 - 60 = 5
        let remaining = Math.max(0, gameState.phaseSeconds - elapsed);    // 180 - 5 = 175
        return Math.floor(remaining % 60);                                // 175 % 60 = 55
    }

    formatTime(): string {
        let minutes = this.calcMinutes()
        let seconds = this.calcSeconds()

        let minString = (minutes < 10) ? `0${minutes}` : `${minutes}`
        let secString = (seconds < 10) ? `0${seconds}` : `${seconds}`
        let time = `${minString}:${secString}`

        return time
    }

    Delete() {
        this.timerWidget && mod.DeleteUIWidget(this.timerWidget)
    }

    Open() {
        this.timerWidget && mod.SetUIWidgetVisible(this.timerWidget, true)
    }

    Update() {
        if (this.timerTextWidget) {
            // let time = this.formatTime()
            // logger.log(`${time}`)

            let minutes = this.calcMinutes()
            let seconds = this.calcSeconds()
            let key

            if (minutes >= 10 && seconds >= 10) {
                key = mod.stringkeys.InfectedTimermmss;
            } else if (minutes >= 10 && seconds < 10) {
                key = mod.stringkeys.InfectedTimermm0s;
            } else if (minutes < 10 && seconds >= 10) {
                key = mod.stringkeys.InfectedTimer0mss;
            } else {
                key = mod.stringkeys.InfectedTimer0m0s;
            }

            mod.SetUITextLabel(this.timerTextWidget, mod.Message(key, minutes, seconds));
        }
    }
}

class InfectionGameState {
    static Instance = new InfectionGameState();
    gameStarted = false;
    pointInTime: number = 0;
    phaseWait: boolean = false;

    players: Map<number, InfectionPlayer> = new Map<number, InfectionPlayer>();
    survivors: Map<number, InfectionPlayer> = new Map<number, InfectionPlayer>();
    infected: Map<number, InfectionPlayer> = new Map<number, InfectionPlayer>();

    matchStatus: MatchStatus = MatchStatus.LOBBY;
    minPlayersToStart: number = INFECTION_CFG.GAMEMODE.MINIMUM_PLAYERS
    initialInfectedCount: number = INFECTION_CFG.GAMEMODE.INITIAL_INFECTED_COUNT

    numberOfRounds: number = INFECTION_CFG.GAMEMODE.NUM_OF_ROUNDS
    preRoundSeconds: number = INFECTION_CFG.GAMEMODE.PRE_ROUND_SECONDS
    countdownSeconds: number = INFECTION_CFG.GAMEMODE.COUNTDOWN_SECONDS
    roundSeconds: number = INFECTION_CFG.GAMEMODE.ROUND_SECONDS
    roundEndSeconds: number = INFECTION_CFG.GAMEMODE.ROUND_END_SECONDS

    phaseSeconds: number = 0
    currentRound: number = 0
    survivorWinCount: number = 0
    infectedWinCount: number = 0

    InfectedCountUI: BFI_UIInfectedCount = new BFI_UIInfectedCount();
    InfectedTimerUI: BFI_UIMatchTimer = new BFI_UIMatchTimer();

    constructor(minPlayersToStart?: number, initialInfectedCount?: number, numberOfRounds?: number, preRoundSeconds?: number, countdownSeconds?: number, roundSeconds?: number, roundEndSeconds?: number) {
        if (minPlayersToStart) this.minPlayersToStart = minPlayersToStart;
        if (initialInfectedCount) this.initialInfectedCount = initialInfectedCount;
        if (numberOfRounds) this.numberOfRounds = numberOfRounds;
        if (preRoundSeconds) this.preRoundSeconds = preRoundSeconds
        if (countdownSeconds) this.countdownSeconds = countdownSeconds;
        if (roundSeconds) this.roundSeconds = roundSeconds;
        if (roundEndSeconds) this.roundEndSeconds = roundEndSeconds;
    }

    initGameState() {
        mod.SetSpawnMode(mod.SpawnModes.Deploy)
        this.initScoreboard();

        if (DEV_BUILD.ENABLED) this.spawnAI()

        this.mainGameLoop();
    }

    async spawnAI() {
        for (let i = 0; i < DEV_BUILD.BOTS; i++) {
            mod.SpawnAIFromAISpawner(mod.GetSpawner(DEV_BUILD.SPAWNER_ID), mod.SoldierClass.Recon, mod.GetTeam(1))
            await mod.Wait(0.1)
        }
    }

    phaseTimer(phaseTime: number, nextPhase: MatchStatus) {
        if (mod.GetMatchTimeElapsed() >= this.pointInTime + phaseTime) {
            this.matchStatus = nextPhase
            this.phaseWait = false
        }
    }

    initScoreboard() {
        mod.SetScoreboardType(mod.ScoreboardType.CustomTwoTeams)
        mod.SetScoreboardHeader(mod.Message("Survivors"), mod.Message("Infected"))
        mod.SetScoreboardColumnNames(mod.Message("Eliminations"))
    }

    updateUI() {
        this.InfectedCountUI.Update(gameState.survivors.size, gameState.infected.size);
        this.InfectedTimerUI.Update();
    }

    initializePlayer(eventPlayer: mod.Player) {
        if (!mod.IsPlayerValid(eventPlayer)) return;

        const player = new InfectionPlayer(eventPlayer);

        if (gameState.gameStarted) {
            if (gameState.matchStatus === MatchStatus.IN_PROGRESS || gameState.matchStatus === MatchStatus.ROUND_END) {
                player.becomeInfected()
            } else {
                player.becomeSurvivor()
            }
        }

        logger.log(`Player ${player.playerId} joined!`)
    }

    async mainGameLoop() {
        this.gameStarted = true
        mod.EnableAllPlayerDeploy(true)
        logger.log('Infection Game Mode has started.');

        while (this.gameStarted) {
            await mod.Wait(0.25)
            this.updateUI()
            switch (this.matchStatus) {
                case MatchStatus.LOBBY: this.lobbyHandler(); break;
                case MatchStatus.PRE_ROUND: this.preRoundHandler(); break;
                case MatchStatus.COUNTDOWN: this.countdownHandler(); break;
                case MatchStatus.IN_PROGRESS: this.inProgressHandler(); break;
                case MatchStatus.ROUND_END: this.roundEndHandler(); break;
                case MatchStatus.GAME_END: this.gameEndHandler(); break;
            }
        }
    }

    lobbyHandler() {
        logger.log(`Lobby Handler`)
        if (this.players.size >= this.minPlayersToStart) {
            this.matchStatus = MatchStatus.PRE_ROUND
        }
    }

    preRoundHandler() {
        if (!this.phaseWait) {
            this.phaseWait = true
            logger.log(`PreRound Handler`)
            mod.DisplayNotificationMessage(mod.Message("preRoundStart"))
            this.pointInTime = mod.GetMatchTimeElapsed();
            this.phaseSeconds = this.preRoundSeconds
            const preRoundPlayers = this.players.values()
            this.matchStatus = MatchStatus.PRE_ROUND;
            this.currentRound++
            this.survivors.clear();
            this.infected.clear();

            for (const p of preRoundPlayers) {
                p.becomeSurvivor();
            }
        }

        this.phaseTimer(this.preRoundSeconds, MatchStatus.COUNTDOWN)
    }

    countdownHandler() {
        if (!this.phaseWait) {
            this.phaseWait = true
            logger.log(`Countdown Handler`)
            mod.DisplayNotificationMessage(mod.Message("countdownStart"))
            this.matchStatus = MatchStatus.COUNTDOWN;
            this.pointInTime = mod.GetMatchTimeElapsed();
            this.phaseSeconds = this.countdownSeconds
            mod.DeployAllPlayers()
        }

        this.phaseTimer(this.countdownSeconds, MatchStatus.IN_PROGRESS)
    }

    async setupFirstInfected() {
        logger.log(`Setup First Infected`)
        if (this.matchStatus !== MatchStatus.IN_PROGRESS) return;
        const survivors = this.survivors

        const pick = survivors.get(Math.floor(Math.random() * (survivors.size - 1)));

        if (pick) {
            pick.becomeInfected();
        }

        logger.log(`Player ${pick?.playerId} became first Infected!`)
    }

    inProgressHandler() {
        if (!this.phaseWait) {
            this.phaseWait = true
            logger.log(`In Progress Handler`)
            mod.DisplayNotificationMessage(mod.Message("inProgressStart"))
            this.matchStatus = MatchStatus.IN_PROGRESS;
            this.setupFirstInfected()
            this.pointInTime = mod.GetMatchTimeElapsed();
            this.phaseSeconds = this.roundSeconds
        }

        if (this.survivors.size <= 0) {
            this.matchStatus = MatchStatus.ROUND_END
        } else {
            this.phaseTimer(this.roundSeconds, MatchStatus.ROUND_END)
        }
    }

    roundEndHandler() {
        if (!this.phaseWait) {
            this.phaseWait = true
            logger.log(`Round Ended Handler`)
            this.matchStatus = MatchStatus.ROUND_END;
            this.pointInTime = mod.GetMatchTimeElapsed();
            this.phaseSeconds = this.roundEndSeconds
            if (this.survivors.size > 0) {
                this.survivorWinCount++;
                logger.log(`Survivors Win!`)
                mod.DisplayNotificationMessage(mod.Message("roundEndStartSurvivors"))
            } else {
                this.infectedWinCount++;
                logger.log(`Infected Win!`)
                mod.DisplayNotificationMessage(mod.Message("roundEndStartInfected"))
            }
        }
        this.phaseTimer(this.roundEndSeconds, (this.currentRound >= this.numberOfRounds) ? MatchStatus.GAME_END : MatchStatus.PRE_ROUND)
    }

    gameEndHandler() {
        logger.log(`Game Ended Handler`)
        this.matchStatus = MatchStatus.GAME_END;

        mod.EndGameMode(this.getWinningTeam())
    }

    getWinningTeam(): mod.Team {
        let team = 0;
        if (this.survivorWinCount > this.infectedWinCount) {
            team = InfectedTeam.SURVIVORS;
        } else if (this.infectedWinCount > this.survivorWinCount) {
            team = InfectedTeam.INFECTED;
        }

        return mod.GetTeam(team);
    }
}

class DebugLog {
    static Logger = new DebugLog();

    constructor() {

    }

    log(message: string) {
        console.log(`T:${Math.round(mod.GetMatchTimeElapsed())}|M:${MatchStatus[gameState.matchStatus]}|R:${gameState.currentRound}/${gameState.numberOfRounds}| ${message}`)
    }
}

const gameState = InfectionGameState.Instance

const logger = DebugLog.Logger

// MORE SPAWNS (4)
// IMPLEMENT SCOREBOARD
// ALLOW PICKING GUNS (2)
// FIX SELECTION BUG (1)
// FIX DEPLOYING AS SURVIVOR AFTER MATCH STARTS (3)
// DISCORD LINK
// ALPHA ZOMBIE
// lAST SURVIVOR
// fIX WHO WINS