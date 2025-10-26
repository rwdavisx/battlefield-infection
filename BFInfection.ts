import * as modlib from 'modlib';

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

export function OnPlayerLeaveGame(eventNumber: number) {
    const pId = eventNumber;
    gameState.players.delete(pId);

    logger.log(`Player ${pId} left!`)
}

export async function OnPlayerDeployed(eventPlayer: mod.Player) {
    const p = gameState.players.get(mod.GetObjId(eventPlayer));
    if (!p) return;

    p.isDeployed = true;

    if (p.team === InfectedTeam.INFECTED) {
        mod.AddEquipment(p.player, mod.Gadgets.Melee_Combat_Knife)
    } else {
        mod.AddEquipment(p.player, mod.Weapons.Shotgun_M1014)
        mod.AddEquipment(p.player, mod.Gadgets.Melee_Combat_Knife)
    }

    logger.log(`Player ${mod.GetObjId(eventPlayer)} deployed with loadout.`)
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

    await mod.Wait(3);

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

    async becomeInfected() {
        this.team = InfectedTeam.INFECTED;

        if (this.isDeployed) {
            mod.UndeployPlayer(this.player)
            await mod.Wait(0.1)
        }

        if (mod.GetObjId(mod.GetTeam(this.player)) !== this.team) {
            mod.SetTeam(this.player, mod.GetTeam(this.team))
        }

        gameState.infected.set(this.playerId, this);
        gameState.survivors.delete(this.playerId);

        mod.DeployPlayer(this.player)
        // mod.SetPlayerMovementSpeedMultiplier(this.player, 1.25)

        logger.log(`Player ${this.playerId} initialized as Infected!`)
    }

    async becomeSurvivor() {
        this.team = InfectedTeam.SURVIVORS;

        if (this.isDeployed) {
            mod.UndeployPlayer(this.player)
            await mod.Wait(0.1)
        }

        if (mod.GetObjId(mod.GetTeam(this.player)) !== this.team) {
            mod.SetTeam(this.player, mod.GetTeam(this.team))
        }

        gameState.survivors.set(this.playerId, this);
        gameState.infected.delete(this.playerId);

        mod.DeployPlayer(this.player)
        // mod.SetPlayerMovementSpeedMultiplier(this.player, 1.1)

        logger.log(`Player ${this.playerId} initialized as Survivor!`)
    }
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
    sequence: number = 0;
    gameStarted = false;
    pointInTime: number = 0;
    phaseWait: boolean = false;

    players: Map<number, InfectionPlayer> = new Map<number, InfectionPlayer>();
    survivors: Map<number, InfectionPlayer> = new Map<number, InfectionPlayer>();
    infected: Map<number, InfectionPlayer> = new Map<number, InfectionPlayer>();

    matchStatus: MatchStatus = MatchStatus.LOBBY;
    minPlayersToStart: number = 1
    initialInfectedCount: number = 1

    numberOfRounds: number = 5
    preRoundSeconds: number = 15
    countdownSeconds: number = 30
    roundSeconds: number = 300
    roundEndSeconds: number = 15
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
        this.mainGameLoop();
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
            mod.DisplayNotificationMessage(mod.Message("roundEndStart"))
            this.matchStatus = MatchStatus.ROUND_END;
            this.pointInTime = mod.GetMatchTimeElapsed();
            this.phaseSeconds = this.roundEndSeconds
            if (this.survivors.size > 0) {
                this.survivorWinCount++;
            } else {
                this.infectedWinCount++;
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


// Fix spawn points
// Let attackers pick gun class
// Let infected deploy anywhere
// game stopped around 2:25???