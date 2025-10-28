import * as modlib from 'modlib';

const DEV_BUILD = {
    ENABLED: true,
    BOTS: 5,
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
    SCORING: {
        TIME_ALIVE_MULTIPLIER: 2,        // Points per second alive (2 pts/sec)
        ELIMINATION_POINTS: 100,          // Points for killing an infected player
        INFECTION_POINTS: 500,            // Points for infecting a survivor (harder to do)
        DAMAGE_DIVISOR: 10,               // 1 point per 10 damage dealt
    },
    PERFORMANCE: {
        LOADOUT_CHECK_INTERVAL: 1,       // Seconds between loadout restriction checks
        SCOREBOARD_UPDATE_INTERVAL: 1,   // Seconds between scoreboard updates
        MAIN_LOOP_INTERVAL: 0.25,        // Seconds between main loop iterations
    },
    LOADOUTS: {
        ALLOWED_WEAPONS_INFECTED: [],
        ALLOWED_GADGETS_INFECTED: [
            mod.Gadgets.Melee_Combat_Knife,
            mod.Gadgets.Throwable_Throwing_Knife
        ],
        ALLOWED_WEAPONS_SURVIVORS: [
            mod.Weapons.AssaultRifle_AK4D,
            mod.Weapons.AssaultRifle_B36A4,
            mod.Weapons.AssaultRifle_KORD_6P67,
            mod.Weapons.AssaultRifle_L85A3,
            mod.Weapons.AssaultRifle_M433,
            mod.Weapons.AssaultRifle_NVO_228E,
            mod.Weapons.AssaultRifle_SOR_556_Mk2,
            mod.Weapons.AssaultRifle_TR_7,
            mod.Weapons.Carbine_AK_205,
            mod.Weapons.Carbine_GRT_BC,
            mod.Weapons.Carbine_M277,
            mod.Weapons.Carbine_M417_A2,
            mod.Weapons.Carbine_M4A1,
            mod.Weapons.Carbine_QBZ_192,
            mod.Weapons.Carbine_SG_553R,
            mod.Weapons.DMR_LMR27,
            mod.Weapons.DMR_M39_EMR,
            mod.Weapons.DMR_SVDM,
            mod.Weapons.DMR_SVK_86,
            mod.Weapons.LMG_DRS_IAR,
            mod.Weapons.LMG_KTS100_MK8,
            mod.Weapons.LMG_L110,
            mod.Weapons.LMG_M_60,
            mod.Weapons.LMG_M123K,
            mod.Weapons.LMG_M240L,
            mod.Weapons.LMG_M250,
            mod.Weapons.LMG_RPKM,
            mod.Weapons.Shotgun__185KS_K,
            mod.Weapons.Shotgun_M1014,
            mod.Weapons.Shotgun_M87A1,
            mod.Weapons.Sidearm_ES_57,
            mod.Weapons.Sidearm_M44,
            mod.Weapons.Sidearm_M45A1,
            mod.Weapons.Sidearm_P18,
            mod.Weapons.SMG_KV9,
            mod.Weapons.SMG_PW5A3,
            mod.Weapons.SMG_PW7A2,
            mod.Weapons.SMG_SCW_10,
            mod.Weapons.SMG_SGX,
            mod.Weapons.SMG_SL9,
            mod.Weapons.SMG_UMG_40,
            mod.Weapons.SMG_USG_90,
            mod.Weapons.Sniper_M2010_ESR,
            mod.Weapons.Sniper_PSR,
            mod.Weapons.Sniper_SV_98,

        ],
        ALLOWED_GADGETS_SURVIVORS: [
            mod.Gadgets.Class_Adrenaline_Injector,
            mod.Gadgets.Class_Motion_Sensor,
            mod.Gadgets.Class_Repair_Tool,
            mod.Gadgets.Class_Supply_Bag,
            mod.Gadgets.Deployable_Cover,
            mod.Gadgets.Deployable_Deploy_Beacon,
            mod.Gadgets.Deployable_EOD_Bot,
            mod.Gadgets.Deployable_Grenade_Intercept_System,
            mod.Gadgets.Deployable_Missile_Intercept_System,
            mod.Gadgets.Deployable_Portable_Mortar,
            mod.Gadgets.Deployable_Recon_Drone,
            mod.Gadgets.Deployable_Vehicle_Supply_Crate,
            mod.Gadgets.Launcher_Aim_Guided,
            mod.Gadgets.Launcher_Air_Defense,
            mod.Gadgets.Launcher_Auto_Guided,
            mod.Gadgets.Launcher_Breaching_Projectile,
            mod.Gadgets.Launcher_High_Explosive,
            mod.Gadgets.Launcher_Incendiary_Airburst,
            mod.Gadgets.Launcher_Long_Range,
            mod.Gadgets.Launcher_Smoke_Grenade,
            mod.Gadgets.Launcher_Thermobaric_Grenade,
            mod.Gadgets.Launcher_Unguided_Rocket,
            mod.Gadgets.Melee_Combat_Knife,
            mod.Gadgets.Melee_Hunting_Knife,
            mod.Gadgets.Melee_Sledgehammer,
            mod.Gadgets.Misc_Acoustic_Sensor_AV_Mine,
            mod.Gadgets.Misc_Anti_Personnel_Mine,
            mod.Gadgets.Misc_Anti_Vehicle_Mine,
            mod.Gadgets.Misc_Assault_Ladder,
            mod.Gadgets.Misc_Defibrillator,
            mod.Gadgets.Misc_Demolition_Charge,
            mod.Gadgets.Misc_Incendiary_Round_Shotgun,
            mod.Gadgets.Misc_Laser_Designator,
            mod.Gadgets.Misc_Sniper_Decoy,
            mod.Gadgets.Misc_Supply_Pouch,
            mod.Gadgets.Misc_Tracer_Dart,
            mod.Gadgets.Misc_Tripwire_Sensor_AV_Mine,
            mod.Gadgets.Throwable_Anti_Vehicle_Grenade,
            mod.Gadgets.Throwable_Flash_Grenade,
            mod.Gadgets.Throwable_Fragmentation_Grenade,
            mod.Gadgets.Throwable_Incendiary_Grenade,
            mod.Gadgets.Throwable_Mini_Frag_Grenade,
            mod.Gadgets.Throwable_Proximity_Detector,
            mod.Gadgets.Throwable_Smoke_Grenade,
            mod.Gadgets.Throwable_Stun_Grenade,
            mod.Gadgets.Throwable_Throwing_Knife,
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

// Player perks interface for type safety
interface PlayerPerks {
    survivor: {
        speedBoost?: number;
        damageResistance?: number;
    };
    infected: {
        healthRegen?: boolean;
        speedBoost?: number;
    };
}

// Phase interface for state machine pattern
interface IGamePhase {
    status: MatchStatus;
    onEnter(): void | Promise<void>;
    onUpdate(): void;
    onExit?(): void;
    checkTransition(): MatchStatus | null;
}

export async function OnGameModeStarted() {
    mod.EnableAllPlayerDeploy(false)
    gameState.initGameState();
}

export async function OnPlayerJoinGame(eventPlayer: mod.Player) {
    await gameState.initializePlayer(eventPlayer);
}

export async function OnSpawnerSpawned(eventPlayer: mod.Player, eventSpawner: mod.Spawner) {
    await gameState.initializePlayer(eventPlayer);
    console.log(`Spawned bot ${mod.GetObjId(eventPlayer)}`);
}

export function OnPlayerLeaveGame(eventNumber: number) {
    const pId = eventNumber;

    // Remove player from all maps
    gameState.players.delete(pId);
    gameState.survivors.delete(pId);
    gameState.infected.delete(pId);

    logger.log(`Player ${pId} left! Remaining players: ${gameState.players.size}`)
}

export async function OnPlayerDeployed(eventPlayer: mod.Player) {
    const p = gameState.players.get(mod.GetObjId(eventPlayer));
    if (!p) return;

    p.isDeployed = true;
    p.health = p.currentHealth;  // Initialize health when player deploys

    // Initial loadout enforcement is handled by centralized loadoutGuardLoop
    // But we call it once here for immediate enforcement
    LoadoutManager.enforce(p);

    logger.log(`Player ${mod.GetObjId(eventPlayer)} deployed with ${p.health} health`)
}

export function OnPlayerUndeploy(eventPlayer: mod.Player) {
    const p = gameState.players.get(mod.GetObjId(eventPlayer));
    if (p) p.isDeployed = false;

    logger.log(`Player ${p?.playerId} undeployed!`)
}

export async function OnPlayerDied(victimP: mod.Player, killerP: mod.Player) {
    const victimId = mod.GetObjId(victimP);
    const killerId = mod.GetObjId(killerP);

    const victim = gameState.players.get(victimId);
    const killer = gameState.players.get(killerId);

    if (!victim) {
        logger.log(`Warning: Victim player ${victimId} not found in game state`);
        return;
    }

    if (!killer) {
        logger.log(`Warning: Killer player ${killerId} not found in game state`);
        return;
    }

    // Convert survivor to infected if killed during active gameplay
    if (gameState.matchStatus === MatchStatus.IN_PROGRESS && victim.team === InfectedTeam.SURVIVORS) {
        // Mark the player as no longer deployed before role swap logic runs.
        victim.isDeployed = false;
        await victim.becomeInfected();
    }

    logger.log(`Player ${victim.playerId} died!`);
}

export function OnPlayerEarnedKill(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDeathType: mod.DeathType,
    eventWeaponUnlock: mod.WeaponUnlock
) {
    const killerId = mod.GetObjId(eventPlayer);
    const victimId = mod.GetObjId(eventOtherPlayer);

    if (killerId === victimId) {
        logger.log(`Player ${killerId} killed themselves (suicide)`);
        return;
    }

    const killer = gameState.players.get(killerId)
    const victim = gameState.players.get(victimId)

    if (!killer) {
        logger.log(`Warning: Killer player ${killerId} not found in game state`);
        return;
    }

    if (!victim) {
        logger.log(`Warning: Victim player ${victimId} not found in game state`);
        return;
    }

    if (killer.team === InfectedTeam.SURVIVORS && victim.team === InfectedTeam.INFECTED) {
        killer.eliminations++;
        logger.log(`Survivor ${killerId} eliminated Infected ${victimId}`);
    } else if (killer.team === InfectedTeam.INFECTED && victim.team === InfectedTeam.SURVIVORS) {
        killer.infections++;
        logger.log(`Infected ${killerId} infected Survivor ${victimId}`);
    }
}

export function OnPlayerDamaged(
    eventPlayer: mod.Player,
    eventOtherPlayer: mod.Player,
    eventDamageType: mod.DamageType,
    eventWeaponUnlock: mod.WeaponUnlock
) {
    if (!mod.IsPlayerValid(eventPlayer) || !mod.IsPlayerValid(eventOtherPlayer)) return;

    const victim = gameState.players.get(mod.GetObjId(eventPlayer));
    const attacker = gameState.players.get(mod.GetObjId(eventOtherPlayer));

    if (!victim) return;

    // Calculate damage (only count if health decreased, not healing)
    const assignedDamage = Math.max(0, victim.health - victim.currentHealth);

    if (attacker && victim.playerId !== attacker.playerId && assignedDamage > 0) {
        attacker.damageDealt += assignedDamage;
    }

    victim.health = victim.currentHealth;
}

class InfectionPlayer {
    player: mod.Player;
    playerId: number;
    team: InfectedTeam = InfectedTeam.SURVIVORS
    perks: PlayerPerks;
    isDeployed: boolean = false;
    timeAlive: number = 0;
    eliminations: number = 0;
    infections: number = 0;
    damageDealt: number = 0;
    health: number = 0;

    constructor(eventPlayer: mod.Player) {
        this.player = eventPlayer;
        this.playerId = mod.GetObjId(eventPlayer);
        this.perks = { survivor: {}, infected: {} };
        // Health will be initialized when player deploys (currentHealth is 0 until deployed)
        this.health = 0;
    }

    // Separate initialization method to avoid constructor side effects
    initialize(): void {
        mod.SetRedeployTime(this.player, 0);
        logger.log(`Player ${this.playerId} initialized`);
    }

    // Helper to ensure player is on correct team (idempotent)
    private async ensureTeam(team: InfectedTeam): Promise<void> {
        // Validate player is still valid before team operations
        if (!mod.IsPlayerValid(this.player)) {
            logger.log(`Warning: Cannot ensure team for invalid player ${this.playerId}`);
            return;
        }

        const desiredTeamObj = mod.GetTeam(team);
        const currentTeamId = mod.GetObjId(mod.GetTeam(this.player));

        if (currentTeamId !== team) {
            try {
                mod.SetTeam(this.player, desiredTeamObj);
                await mod.Wait(0.05);
                logger.log(`Player ${this.playerId} team set to ${InfectedTeam[team]}`);
            } catch (error) {
                logger.log(`Error setting team for player ${this.playerId}: ${error}`);
                throw error;
            }
        }
    }

    get maxHealth() {
        return (this.isDeployed) ? mod.GetSoldierState(this.player, mod.SoldierStateNumber.MaxHealth) : 0
    }

    get currentHealth() {
        return (this.isDeployed) ? mod.GetSoldierState(this.player, mod.SoldierStateNumber.CurrentHealth) : 0
    }

    get isAlive(): boolean {
        return (this.isDeployed) ? mod.GetSoldierState(this.player, mod.SoldierStateBool.IsAlive) : false
    }

    get isAIPlayer(): boolean {
        return mod.GetSoldierState(this.player, mod.SoldierStateBool.IsAISoldier)
    }

    // Loadout enforcement is now handled by centralized loadoutGuardLoop in InfectionGameState

    async becomeInfected() {
        // Idempotent: if already infected, do nothing
        if (this.team === InfectedTeam.INFECTED) {
            logger.log(`Player ${this.playerId} is already Infected, skipping`);
            return;
        }

        try {
            logger.log(`Player ${this.playerId} becoming Infected...`);

            // Update internal state and maps immediately
            this.team = InfectedTeam.INFECTED;
            gameState.infected.set(this.playerId, this);
            gameState.survivors.delete(this.playerId);

            // Ensure team in game engine
            await this.ensureTeam(InfectedTeam.INFECTED);

            // Clean redeploy when switching roles if already deployed
            if (this.isAlive) {
                try {
                    mod.UndeployPlayer(this.player);
                    await mod.Wait(0.1);
                } catch (error) {
                    logger.log(`Warning: Failed to undeploy player ${this.playerId}: ${error}`);
                }
            }

            // Enforce loadout (remove disallowed, ensure baseline)
            try {
                LoadoutManager.enforce(this);
            } catch (error) {
                logger.log(`Warning: Failed to enforce loadout for player ${this.playerId}: ${error}`);
            }

            // Note: Don't reset stats - player keeps accumulated stats from being a survivor

            logger.log(`Player ${this.playerId} is now Infected!`);
        } catch (error) {
            logger.log(`Critical error in becomeInfected for player ${this.playerId}: ${error}`);
            // Ensure consistent state even on error
            this.team = InfectedTeam.INFECTED;
            gameState.infected.set(this.playerId, this);
            gameState.survivors.delete(this.playerId);
        }
    }

    async becomeSurvivor() {
        // Idempotent: if already survivor, do nothing
        if (this.team === InfectedTeam.SURVIVORS) {
            logger.log(`Player ${this.playerId} is already Survivor, skipping`);
            return;
        }

        try {
            logger.log(`Player ${this.playerId} becoming Survivor...`);

            // Update internal state and maps immediately
            this.team = InfectedTeam.SURVIVORS;
            gameState.survivors.set(this.playerId, this);
            gameState.infected.delete(this.playerId);

            // Ensure team in game engine
            await this.ensureTeam(InfectedTeam.SURVIVORS);

            // Clean redeploy when switching roles if already deployed
            if (this.isAlive) {
                try {
                    mod.UndeployPlayer(this.player);
                    await mod.Wait(0.1);
                } catch (error) {
                    logger.log(`Warning: Failed to undeploy player ${this.playerId}: ${error}`);
                }
            }

            // Enforce loadout (remove disallowed, ensure baseline)
            try {
                LoadoutManager.enforce(this);
            } catch (error) {
                logger.log(`Warning: Failed to enforce loadout for player ${this.playerId}: ${error}`);
            }

            // Reset stats for new round
            this.timeAlive = 0;
            this.eliminations = 0;
            this.infections = 0;
            this.damageDealt = 0;

            logger.log(`Player ${this.playerId} is now a Survivor!`);
        } catch (error) {
            logger.log(`Critical error in becomeSurvivor for player ${this.playerId}: ${error}`);
            // Ensure consistent state even on error
            this.team = InfectedTeam.SURVIVORS;
            gameState.survivors.set(this.playerId, this);
            gameState.infected.delete(this.playerId);
        }
    }
}

class LoadoutManager {
    static allowedWeaponsInfected: mod.Weapons[] = INFECTION_CFG.LOADOUTS.ALLOWED_WEAPONS_INFECTED;
    static allowedGadgetsInfected: mod.Gadgets[] = INFECTION_CFG.LOADOUTS.ALLOWED_GADGETS_INFECTED
    static allowedWeaponsSurvivors: mod.Weapons[] = INFECTION_CFG.LOADOUTS.ALLOWED_WEAPONS_SURVIVORS
    static allowedGadgetsSurvivors: mod.Gadgets[] = INFECTION_CFG.LOADOUTS.ALLOWED_GADGETS_SURVIVORS
    static infectedThrowableKnives: number = INFECTION_CFG.LOADOUTS.NUM_INFECTED_THROWING_KNIVES - 1

    // Cached enum values and Sets for O(1) lookups (performance optimization)
    private static allWeaponsCache: mod.Weapons[] | null = null;
    private static allGadgetsCache: mod.Gadgets[] | null = null;
    private static allowedWeaponsInfectedSet: Set<mod.Weapons> | null = null;
    private static allowedWeaponsSurvivorsSet: Set<mod.Weapons> | null = null;
    private static allowedGadgetsInfectedSet: Set<mod.Gadgets> | null = null;
    private static allowedGadgetsSurvivorsSet: Set<mod.Gadgets> | null = null;

    private static enumValues<E extends Record<string, string | number>>(e: E): (E[keyof E])[] {
        return Object.values(e).filter((v) => typeof v === "number") as (E[keyof E])[];
    }

    private static getAllWeapons(): mod.Weapons[] {
        if (!this.allWeaponsCache) {
            this.allWeaponsCache = this.enumValues(mod.Weapons);
        }
        return this.allWeaponsCache;
    }

    private static getAllGadgets(): mod.Gadgets[] {
        if (!this.allGadgetsCache) {
            this.allGadgetsCache = this.enumValues(mod.Gadgets);
        }
        return this.allGadgetsCache;
    }

    private static getAllowedWeaponsSet(team: InfectedTeam): Set<mod.Weapons> {
        if (team === InfectedTeam.INFECTED) {
            if (!this.allowedWeaponsInfectedSet) {
                this.allowedWeaponsInfectedSet = new Set(this.allowedWeaponsInfected);
            }
            return this.allowedWeaponsInfectedSet;
        } else {
            if (!this.allowedWeaponsSurvivorsSet) {
                this.allowedWeaponsSurvivorsSet = new Set(this.allowedWeaponsSurvivors);
            }
            return this.allowedWeaponsSurvivorsSet;
        }
    }

    private static getAllowedGadgetsSet(team: InfectedTeam): Set<mod.Gadgets> {
        if (team === InfectedTeam.INFECTED) {
            if (!this.allowedGadgetsInfectedSet) {
                this.allowedGadgetsInfectedSet = new Set(this.allowedGadgetsInfected);
            }
            return this.allowedGadgetsInfectedSet;
        } else {
            if (!this.allowedGadgetsSurvivorsSet) {
                this.allowedGadgetsSurvivorsSet = new Set(this.allowedGadgetsSurvivors);
            }
            return this.allowedGadgetsSurvivorsSet;
        }
    }

    static restrictWeapons(player: InfectionPlayer) {
        const allWeapons = this.getAllWeapons();
        const allowedSet = this.getAllowedWeaponsSet(player.team);

        for (const weapon of allWeapons) {
            const has = mod.HasEquipment(player.player, weapon);
            if (has && !allowedSet.has(weapon)) {
                mod.RemoveEquipment(player.player, weapon);
                logger.log(`Removed ${mod.Weapons[weapon]} from ${player.playerId}`);
            }
        }
    }

    static restrictGadgets(player: InfectionPlayer) {
        const allGadgets = this.getAllGadgets();
        const allowedSet = this.getAllowedGadgetsSet(player.team);

        for (const gadget of allGadgets) {
            const has = mod.HasEquipment(player.player, gadget);
            if (has && !allowedSet.has(gadget)) {
                mod.RemoveEquipment(player.player, gadget);
                logger.log(`Removed ${mod.Gadgets[gadget]} from ${player.playerId}`);
            }
        }
    }

    // Main enforcement method: restrict disallowed items and ensure baseline loadout
    static enforce(player: InfectionPlayer): void {
        if (!mod.IsPlayerValid(player.player) || !player.isDeployed || !player.isAlive) {
            return;
        }

        this.restrictWeapons(player);
        this.restrictGadgets(player);
        this.ensureBaseline(player);
    }

    // Ensure player has minimum required equipment
    private static ensureBaseline(player: InfectionPlayer): void {
        if (player.team === InfectedTeam.INFECTED) {
            // Infected must have combat knife
            if (!mod.HasEquipment(player.player, mod.Gadgets.Melee_Combat_Knife)) {
                mod.AddEquipment(player.player, mod.Gadgets.Melee_Combat_Knife);
                logger.log(`Gave Combat Knife to infected player ${player.playerId}`);
            }

            // Infected must have throwing knives with ammo
            if (!mod.HasEquipment(player.player, mod.Gadgets.Throwable_Throwing_Knife)) {
                mod.AddEquipment(player.player, mod.Gadgets.Throwable_Throwing_Knife);
                mod.SetInventoryAmmo(player.player, mod.InventorySlots.Throwable, this.infectedThrowableKnives);
                logger.log(`Gave Throwing Knives to infected player ${player.playerId}`);
            }
        } else {
            // Survivors must have at least one allowed weapon
            if (!this.hasAnyAllowedWeapon(player, this.allowedWeaponsSurvivors)) {
                // Validate config has weapons defined
                if (this.allowedWeaponsSurvivors.length === 0) {
                    logger.log(`Error: No allowed weapons configured for survivors!`);
                    return;
                }
                // Give them the first allowed weapon (default loadout)
                mod.AddEquipment(player.player, this.allowedWeaponsSurvivors[0]);
                logger.log(`Gave default weapon to survivor ${player.playerId}`);
            }
        }
    }

    // Check if player has any weapon from the allowed list
    private static hasAnyAllowedWeapon(player: InfectionPlayer, allowedList: mod.Weapons[]): boolean {
        for (const weapon of allowedList) {
            if (mod.HasEquipment(player.player, weapon)) {
                return true;
            }
        }
        return false;
    }
}

class ScoreboardManager {
    static Instance = new ScoreboardManager();
    private updateFrequency: number = INFECTION_CFG.PERFORMANCE.SCOREBOARD_UPDATE_INTERVAL;

    private constructor() { }

    initScoreboard() {
        mod.SetScoreboardType(mod.ScoreboardType.CustomTwoTeams)
        mod.SetScoreboardHeader(mod.Message("Survivors"), mod.Message("Infected"))
        mod.SetScoreboardColumnNames(
            mod.Message("totalScore"),
            mod.Message("timeAlive"),
            mod.Message("eliminations"),
            mod.Message("infections"),
            mod.Message("damageDealt")
        );
        mod.SetScoreboardColumnWidths(1.0, 1.0, 1.0, 1.0, 1.0);
        mod.SetScoreboardSorting(1, true);
    }

    async scoreboardLoop() {
        while (gameState.gameStarted) {
            await mod.Wait(this.updateFrequency);
            if (!gameState.gameStarted) break;
            this.updateAllPlayers();
        }
    }

    updateAllPlayers() {
        for (const player of gameState.players.values()) {
            this.updatePlayer(player);
        }
    }

    updatePlayer(p: InfectionPlayer) {
        if (p.team === InfectedTeam.SURVIVORS && p.isAlive) {
            p.timeAlive += this.updateFrequency;
        }

        const timeScore = Math.floor(p.timeAlive * INFECTION_CFG.SCORING.TIME_ALIVE_MULTIPLIER);
        const elimScore = p.eliminations * INFECTION_CFG.SCORING.ELIMINATION_POINTS;
        const infectScore = p.infections * INFECTION_CFG.SCORING.INFECTION_POINTS;
        const dmgScore = Math.floor(p.damageDealt / INFECTION_CFG.SCORING.DAMAGE_DIVISOR);
        const totalScore = timeScore + elimScore + infectScore + dmgScore;

        mod.SetScoreboardPlayerValues(
            p.player,
            totalScore,
            timeScore,
            p.eliminations,
            p.infections,
            dmgScore
        );
    }

    resetAllPlayers() {
        for (const p of gameState.players.values()) {
            p.timeAlive = 0;
            p.eliminations = 0;
            p.infections = 0;
            p.damageDealt = 0;
        }
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
                bgAlpha: 0.75,
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

class BFI_UIVersion {
    versionWidget: mod.UIWidget | undefined;

    constructor() {
        this.versionWidget = modlib.ParseUI(
            {
                name: "Text_6GZDR",
                type: "Text",
                position: [0, 0],
                size: [180, 40],
                anchor: mod.UIAnchor.BottomRight,
                visible: true,
                padding: 8,
                bgColor: [1, 1, 1],
                bgAlpha: 1,
                bgFill: mod.UIBgFill.None,
                textLabel: mod.stringkeys.versionNumber,
                textColor: [1, 1, 1],
                textAlpha: 1,
                textSize: 20,
                textAnchor: mod.UIAnchor.CenterRight
            }
        );
    }
}

class BFI_UIRoundPhase {
    roundPhaseWidget: mod.UIWidget | undefined;
    roundTextWidget: mod.UIWidget | undefined;
    phaseTextWidget: mod.UIWidget | undefined;

    private static PHASE_COLORS: Record<MatchStatus, [number, number, number]> = {
        [MatchStatus.LOBBY]: [1, 0.9882, 0.6118],
        [MatchStatus.PRE_ROUND]: [0.4392, 0.9216, 1],
        [MatchStatus.COUNTDOWN]: [1, 0.5137, 0.3804],
        [MatchStatus.IN_PROGRESS]: [0.6784, 0.9922, 0.5255],
        [MatchStatus.ROUND_END]: [1, 0.9882, 0.6118],
        [MatchStatus.GAME_END]: [1, 0.5137, 0.3804]
    };

    constructor() {

        const roundTextName = "Round_Text"
        const phaseTextName = "Phase_Text"

        this.roundPhaseWidget = modlib.ParseUI(
            {
                name: "roundPhase_container",
                type: "Container",
                position: [1660, 851.68],
                size: [260, 45],
                anchor: mod.UIAnchor.TopLeft,
                visible: true,
                padding: 0,
                bgColor: [0.0314, 0.0431, 0.0431],
                bgAlpha: 0.75,
                bgFill: mod.UIBgFill.Blur,
                children: [
                    {
                        name: roundTextName,
                        type: "Text",
                        position: [0, 0],
                        size: [125, 30],
                        anchor: mod.UIAnchor.CenterLeft,
                        visible: true,
                        padding: 8,
                        bgColor: [0.2, 0.2, 0.2],
                        bgAlpha: 1,
                        bgFill: mod.UIBgFill.None,
                        textLabel: mod.Message(mod.stringkeys.roundText, 0, 0),
                        textColor: [1, 1, 1],
                        textAlpha: 1,
                        textSize: 18,
                        textAnchor: mod.UIAnchor.CenterLeft
                    },
                    {
                        name: phaseTextName,
                        type: "Text",
                        position: [0, 0],
                        size: [125, 30],
                        anchor: mod.UIAnchor.CenterRight,
                        visible: true,
                        padding: 0,
                        bgColor: [0.6784, 0.9922, 0.5255],
                        bgAlpha: 1,
                        bgFill: mod.UIBgFill.None,
                        textLabel: mod.stringkeys.phaseWaiting,
                        textColor: [0.6784, 0.9922, 0.5255],
                        textAlpha: 1,
                        textSize: 18,
                        textAnchor: mod.UIAnchor.CenterLeft
                    }
                ]
            }
        );

        this.roundTextWidget = mod.FindUIWidgetWithName(roundTextName);
        this.phaseTextWidget = mod.FindUIWidgetWithName(phaseTextName);
    }

    Update() {
        let currentRound = gameState.currentRound
        let totalRounds = gameState.numberOfRounds

        if (this.roundTextWidget) {
            mod.SetUITextLabel(
                this.roundTextWidget,
                mod.Message(mod.stringkeys.roundText, currentRound, totalRounds)
            );
        }

        if (this.phaseTextWidget) {
            let key;
            switch (gameState.matchStatus) {
                case MatchStatus.LOBBY:
                    key = mod.stringkeys.phaseWaiting;
                    break;
                case MatchStatus.PRE_ROUND:
                    key = mod.stringkeys.phaseDeploying;
                    break;
                case MatchStatus.COUNTDOWN:
                    key = mod.stringkeys.phaseStarting;
                    break;
                case MatchStatus.IN_PROGRESS:
                    key = mod.stringkeys.phaseActive;
                    break;
                case MatchStatus.ROUND_END:
                    key = mod.stringkeys.phaseRestarting;
                    break;
                case MatchStatus.GAME_END:
                    key = mod.stringkeys.phaseGameOver;
                    break;
                default:
                    key = mod.stringkeys.phaseWaiting;
                    break;
            }

            mod.SetUITextLabel(this.phaseTextWidget, mod.Message(key));

            const color = BFI_UIRoundPhase.PHASE_COLORS[gameState.matchStatus] ?? [1, 1, 1];
            mod.SetUITextColor(this.phaseTextWidget, mod.CreateVector(color[0], color[1], color[2]));
        }
    }
}

// Base phase class with common timer logic
abstract class GamePhase implements IGamePhase {
    protected game: InfectionGameState;
    protected phaseStartTime: number = 0;
    protected hasEntered: boolean = false;

    abstract status: MatchStatus;
    abstract get phaseDuration(): number;

    constructor(game: InfectionGameState) {
        this.game = game;
    }

    onEnter(): void {
        this.hasEntered = true;
        this.phaseStartTime = mod.GetMatchTimeElapsed();
        this.game.pointInTime = this.phaseStartTime;
        this.game.phaseSeconds = this.phaseDuration;
        logger.log(`Entered ${MatchStatus[this.status]} phase`);
    }

    abstract onUpdate(): void;

    onExit(): void {
        this.hasEntered = false;
        logger.log(`Exiting ${MatchStatus[this.status]} phase`);
    }

    checkTransition(): MatchStatus | null {
        // Default: transition after timer expires
        if (this.hasTimerExpired()) {
            return this.getNextPhase();
        }
        return null;
    }

    protected hasTimerExpired(): boolean {
        return mod.GetMatchTimeElapsed() >= this.phaseStartTime + this.phaseDuration;
    }

    protected getElapsedTime(): number {
        return mod.GetMatchTimeElapsed() - this.phaseStartTime;
    }

    abstract getNextPhase(): MatchStatus;
}

// Lobby Phase: Wait for minimum players
class LobbyPhase extends GamePhase {
    status = MatchStatus.LOBBY;
    get phaseDuration() { return 0; } // No timer in lobby

    onEnter(): void {
        super.onEnter();
        mod.DisplayNotificationMessage(mod.Message("Waiting for players..."));
    }

    onUpdate(): void {
        // Check continuously for minimum players
    }

    checkTransition(): MatchStatus | null {
        if (this.game.players.size >= this.game.minPlayersToStart) {
            logger.log(`Minimum players reached (${this.game.players.size}/${this.game.minPlayersToStart})`);
            return MatchStatus.PRE_ROUND;
        }
        return null;
    }

    getNextPhase(): MatchStatus {
        return MatchStatus.PRE_ROUND;
    }
}

// Pre-Round Phase: Assign all players to survivors
class PreRoundPhase extends GamePhase {
    status = MatchStatus.PRE_ROUND;
    get phaseDuration() { return this.game.preRoundSeconds; }

    async onEnter(): Promise<void> {
        super.onEnter();
        this.game.currentRound++;
        mod.DisplayNotificationMessage(mod.Message("preRoundStart"));

        // Reset teams
        this.game.survivors.clear();
        this.game.infected.clear();

        // Assign all players to survivors (await each to prevent race conditions)
        for (const player of this.game.players.values()) {
            await player.becomeSurvivor();
        }

        logger.log(`Round ${this.game.currentRound}/${this.game.numberOfRounds} starting`);
    }

    onUpdate(): void {
        // Nothing to update during pre-round
    }

    getNextPhase(): MatchStatus {
        return MatchStatus.COUNTDOWN;
    }
}

// Countdown Phase: Players deploy and prepare
class CountdownPhase extends GamePhase {
    status = MatchStatus.COUNTDOWN;
    get phaseDuration() { return this.game.countdownSeconds; }

    onEnter(): void {
        super.onEnter();
        mod.DisplayNotificationMessage(mod.Message("countdownStart"));
    }

    onUpdate(): void {
        // Nothing to update during countdown
    }

    getNextPhase(): MatchStatus {
        return MatchStatus.IN_PROGRESS;
    }
}

// In Progress Phase: Active gameplay
class InProgressPhase extends GamePhase {
    status = MatchStatus.IN_PROGRESS;
    get phaseDuration() { return this.game.roundSeconds; }

    async onEnter(): Promise<void> {
        super.onEnter();
        mod.DeployAllPlayers();
        mod.DisplayNotificationMessage(mod.Message("inProgressStart"));
        await this.setupFirstInfected();
    }

    onUpdate(): void {
        // Check win condition: all survivors infected
        // (transition handled by checkTransition for consistency)
        if (this.game.survivors.size <= 0) {
            logger.log(`All survivors infected! Infected team wins.`);
        }
    }

    checkTransition(): MatchStatus | null {
        // Check win condition first (immediate transition)
        if (this.game.survivors.size <= 0) {
            return MatchStatus.ROUND_END;
        }
        // Otherwise check timer
        return super.checkTransition();
    }

    getNextPhase(): MatchStatus {
        return MatchStatus.ROUND_END;
    }

    private async setupFirstInfected(): Promise<void> {
        const survivorArray = Array.from(this.game.survivors.values());

        if (survivorArray.length === 0) {
            logger.log(`Error: No survivors available to select as first infected!`);
            return;
        }

        const initialInfectedTarget = Math.min(this.game.initialInfectedCount, survivorArray.length);

        if (initialInfectedTarget <= 0) {
            logger.log(`Initial infected count configured as 0; no survivors infected at round start.`);
            return;
        }

        const shuffledSurvivors = [...survivorArray];
        for (let i = shuffledSurvivors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledSurvivors[i], shuffledSurvivors[j]] = [shuffledSurvivors[j], shuffledSurvivors[i]];
        }

        const selectedSurvivors = shuffledSurvivors.slice(0, initialInfectedTarget);

        for (const survivor of selectedSurvivors) {
            await survivor.becomeInfected();
        }

        if (selectedSurvivors.length > 0) {
            const selectedIds = selectedSurvivors.map((survivor) => survivor.playerId).join(', ');
            logger.log(`Selected ${selectedSurvivors.length} initial infected: ${selectedIds}`);
        }
    }
}

// Round End Phase: Display results and determine winner
class RoundEndPhase extends GamePhase {
    status = MatchStatus.ROUND_END;
    get phaseDuration() { return this.game.roundEndSeconds; }

    onEnter(): void {
        super.onEnter();

        // Determine round winner
        if (this.game.survivors.size > 0) {
            this.game.survivorWinCount++;
            logger.log(`Survivors win round ${this.game.currentRound}!`);
            mod.DisplayNotificationMessage(mod.Message("roundEndStartSurvivors"));
        } else {
            this.game.infectedWinCount++;
            logger.log(`Infected win round ${this.game.currentRound}!`);
            mod.DisplayNotificationMessage(mod.Message("roundEndStartInfected"));
        }

        logger.log(`Score: Survivors ${this.game.survivorWinCount} - ${this.game.infectedWinCount} Infected`);
    }

    onUpdate(): void {
        // Nothing to update during round end
    }

    getNextPhase(): MatchStatus {
        // Check if all rounds completed
        if (this.game.currentRound >= this.game.numberOfRounds) {
            return MatchStatus.GAME_END;
        }
        return MatchStatus.PRE_ROUND;
    }
}

// Game End Phase: Match complete
class GameEndPhase extends GamePhase {
    status = MatchStatus.GAME_END;
    get phaseDuration() { return 0; } // No timer, game ends immediately

    onEnter(): void {
        super.onEnter();
        logger.log(`Game ended! Final score: Survivors ${this.game.survivorWinCount} - ${this.game.infectedWinCount} Infected`);
        mod.EndGameMode(this.game.getWinningTeam());
        this.game.cleanup();
    }

    onUpdate(): void {
        // Game is over, nothing to update
    }

    checkTransition(): MatchStatus | null {
        return null; // No transitions from game end
    }

    getNextPhase(): MatchStatus {
        return MatchStatus.GAME_END; // Stay in game end
    }
}

class InfectionGameState {
    static Instance = new InfectionGameState();
    gameStarted = false;
    pointInTime: number = 0;

    players: Map<number, InfectionPlayer> = new Map<number, InfectionPlayer>();
    survivors: Map<number, InfectionPlayer> = new Map<number, InfectionPlayer>();
    infected: Map<number, InfectionPlayer> = new Map<number, InfectionPlayer>();

    matchStatus: MatchStatus = MatchStatus.LOBBY;

    // Phase management
    private phases: Map<MatchStatus, IGamePhase> = new Map();
    private currentPhase: IGamePhase | null = null;
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
    InfectedRoundPhaseUI: BFI_UIRoundPhase = new BFI_UIRoundPhase();
    InfectedVersionUI: BFI_UIVersion = new BFI_UIVersion();

    constructor(minPlayersToStart?: number, initialInfectedCount?: number, numberOfRounds?: number, preRoundSeconds?: number, countdownSeconds?: number, roundSeconds?: number, roundEndSeconds?: number) {
        if (minPlayersToStart) this.minPlayersToStart = minPlayersToStart;
        if (initialInfectedCount) this.initialInfectedCount = initialInfectedCount;
        if (numberOfRounds) this.numberOfRounds = numberOfRounds;
        if (preRoundSeconds) this.preRoundSeconds = preRoundSeconds
        if (countdownSeconds) this.countdownSeconds = countdownSeconds;
        if (roundSeconds) this.roundSeconds = roundSeconds;
        if (roundEndSeconds) this.roundEndSeconds = roundEndSeconds;

        // Initialize all phases
        this.initializePhases();
    }

    private initializePhases() {
        this.phases.set(MatchStatus.LOBBY, new LobbyPhase(this));
        this.phases.set(MatchStatus.PRE_ROUND, new PreRoundPhase(this));
        this.phases.set(MatchStatus.COUNTDOWN, new CountdownPhase(this));
        this.phases.set(MatchStatus.IN_PROGRESS, new InProgressPhase(this));
        this.phases.set(MatchStatus.ROUND_END, new RoundEndPhase(this));
        this.phases.set(MatchStatus.GAME_END, new GameEndPhase(this));

        // Start in lobby
        this.currentPhase = this.phases.get(MatchStatus.LOBBY) || null;
    }

    async transitionToPhase(newStatus: MatchStatus): Promise<void> {
        const newPhase = this.phases.get(newStatus);
        if (!newPhase) {
            logger.log(`Error: Phase ${MatchStatus[newStatus]} not found!`);
            return;
        }

        // Exit current phase
        if (this.currentPhase && this.currentPhase.onExit) {
            this.currentPhase.onExit();
        }

        // Update status
        this.matchStatus = newStatus;
        this.currentPhase = newPhase;

        // Enter new phase (await if async)
        await this.currentPhase.onEnter();

        logger.log(`Transitioned to ${MatchStatus[newStatus]}`);
    }

    initGameState() {
        mod.SetSpawnMode(mod.SpawnModes.Deploy)
        scoreboard.initScoreboard()

        if (DEV_BUILD.ENABLED) this.spawnAI()

        this.mainGameLoop();
        scoreboard.scoreboardLoop();
        this.loadoutGuardLoop();
    }

    // Centralized loadout enforcement loop (replaces per-player loops)
    async loadoutGuardLoop() {
        while (this.gameStarted) {
            await mod.Wait(INFECTION_CFG.PERFORMANCE.LOADOUT_CHECK_INTERVAL);
            if (!this.gameStarted) break;

            // Iterate through all players and enforce loadouts
            for (const player of this.players.values()) {
                try {
                    LoadoutManager.enforce(player);
                } catch (error) {
                    logger.log(`Error enforcing loadout for player ${player.playerId}: ${error}`);
                }
            }
        }
        logger.log('Loadout guard loop ended.');
    }

    async spawnAI() {
        for (let i = 0; i < DEV_BUILD.BOTS; i++) {
            mod.SpawnAIFromAISpawner(mod.GetSpawner(DEV_BUILD.SPAWNER_ID), mod.SoldierClass.Recon, mod.GetTeam(1))
            await mod.Wait(0.1)
        }
    }

    updateUI() {
        this.InfectedCountUI.Update(gameState.survivors.size, gameState.infected.size);
        this.InfectedTimerUI.Update();
        this.InfectedRoundPhaseUI.Update();
    }

    async initializePlayer(eventPlayer: mod.Player): Promise<void> {
        if (!mod.IsPlayerValid(eventPlayer)) {
            logger.log(`Warning: Attempted to initialize invalid player`);
            return;
        }

        const playerId = mod.GetObjId(eventPlayer);

        // Check if player already exists
        if (this.players.has(playerId)) {
            logger.log(`Warning: Player ${playerId} already initialized`);
            return;
        }

        // Create player object (no side effects in constructor now)
        const player = new InfectionPlayer(eventPlayer);

        // Add to game state
        this.players.set(player.playerId, player);

        // Initialize player (sets redeploy time, no longer starts loadout loop)
        player.initialize();

        // Assign to team based on game state (await to prevent race conditions)
        if (this.gameStarted) {
            if (this.matchStatus === MatchStatus.IN_PROGRESS || this.matchStatus === MatchStatus.ROUND_END) {
                logger.log(`Player ${player.playerId} joined mid-game, assigning to Infected team`);
                await player.becomeInfected();
            } else {
                logger.log(`Player ${player.playerId} joined during ${MatchStatus[this.matchStatus]}, assigning to Survivors team`);
                await player.becomeSurvivor();
            }
        } else {
            logger.log(`Player ${player.playerId} joined before game started`);
        }
    }

    async mainGameLoop() {
        this.gameStarted = true;
        mod.EnableAllPlayerDeploy(true);
        logger.log('Infection Game Mode started with phase-based state machine.');

        // Enter initial phase (Lobby)
        if (this.currentPhase) {
            await this.currentPhase.onEnter();
        }

        while (this.gameStarted) {
            await mod.Wait(INFECTION_CFG.PERFORMANCE.MAIN_LOOP_INTERVAL);
            this.updateUI();

            if (!this.currentPhase) {
                logger.log('Error: No current phase!');
                break;
            }

            // Update current phase
            this.currentPhase.onUpdate();

            // Check for phase transitions
            const nextStatus = this.currentPhase.checkTransition();
            if (nextStatus !== null && nextStatus !== this.matchStatus) {
                await this.transitionToPhase(nextStatus);
            }

            // Safety check: if no players, return to lobby
            if (this.players.size === 0 && this.matchStatus !== MatchStatus.LOBBY && this.matchStatus !== MatchStatus.GAME_END) {
                logger.log('All players left! Returning to lobby.');
                await this.transitionToPhase(MatchStatus.LOBBY);
            }
        }

        logger.log('Game loop ended.');
    }

    cleanup() {
        logger.log('Cleaning up game state...')
        this.gameStarted = false;
        this.players.clear();
        this.survivors.clear();
        this.infected.clear();
        this.currentRound = 0;
        this.survivorWinCount = 0;
        this.infectedWinCount = 0;
    }

    getWinningTeam(): mod.Team {
        let team: number;
        if (this.survivorWinCount > this.infectedWinCount) {
            team = InfectedTeam.SURVIVORS;
            logger.log(`Survivors win the match! (${this.survivorWinCount} - ${this.infectedWinCount})`);
        } else if (this.infectedWinCount > this.survivorWinCount) {
            team = InfectedTeam.INFECTED;
            logger.log(`Infected win the match! (${this.infectedWinCount} - ${this.survivorWinCount})`);
        } else {
            // In case of a tie, survivors win (they survived!)
            team = InfectedTeam.SURVIVORS;
            logger.log(`Match tied! Survivors win by default. (${this.survivorWinCount} - ${this.infectedWinCount})`);
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
const scoreboard = ScoreboardManager.Instance
const logger = DebugLog.Logger

// MORE SPAWNS (4)

// ALLOW PICKING GUNS (2)
// DISCORD LINK
// ALPHA ZOMBIE
// lAST SURVIVOR
// fIX WHO WINS

// Add round counter
// Add match status UI
// add loop to handle if players leave
// look into kits not being available on different teams
