import {
	Ability,
	antimage_blink,
	DOTA_CHAT_MESSAGE,
	DOTA_RUNES,
	dotaunitorder_t,
	ember_spirit_sleight_of_fist,
	Entity,
	EntityManager,
	EventsSDK,
	ExecuteOrder,
	Hero,
	Item,
	item_aegis,
	NetworkedParticle,
	npc_dota_hero_arc_warden,
	npc_dota_hero_meepo,
	pangolier_swashbuckle,
	PhysicalItem,
	queenofpain_blink,
	Roshan,
	RoshanSpawner,
	Rune,
	Sleeper,
	SpiritBear,
	Unit,
	Vector3
} from "github.com/octarine-public/wrapper/index"

import { GUIManager } from "./gui/manager"
import { MenuManager } from "./menu/manager"
import { Storage } from "./storage/storage"
import { BlinkAbilityWrap } from "./storage/wrap/ability/bilnk"
import { SleightOfFistAbilityWrap } from "./storage/wrap/ability/sleight-of-fist"
import { SwashbuckleAbilityWrap } from "./storage/wrap/ability/swashbuckle"
import { AbilityWrap } from "./storage/wrap/ability/wrap"
import { ArcWardenUnitWrap } from "./storage/wrap/unit/arc-warden"
import { MeepoUnitWrap } from "./storage/wrap/unit/meepo"
import { SpiritBearUnitWrap } from "./storage/wrap/unit/spirit-bear"
import { UnitWrap } from "./storage/wrap/unit/wrap"

new (class Snatcher {
	constructor() {
		this.sleeper = new Sleeper()
		this.menuManager = new MenuManager(this.sleeper)
		this.guiManager = new GUIManager(this.menuManager)

		EventsSDK.on("GameStarted", (): void => this.OnGameChanged())
		EventsSDK.on("GameEnded", (): void => this.OnGameChanged())
		EventsSDK.on("PostDataUpdate", (dt: number): void => (dt === 0 ? (() => {})() : this.OnTick()))
		EventsSDK.on("Draw", (): void => this.OnDraw())
		EventsSDK.on("ChatEvent", (type: DOTA_CHAT_MESSAGE): void => this.OnChatEvent(type))
		EventsSDK.on("EntityCreated", (entity: Entity): void => this.OnEntityCreated(entity))
		EventsSDK.on("EntityDestroyed", (entity: Entity): void => this.OnEntityDestroyed(entity))
		EventsSDK.on("UnitItemsChanged", (entity: Entity): void => this.OnUnitItemsChanged(entity))
		EventsSDK.on("UnitAbilitiesChanged", (entity: Entity): void => this.OnUnitAbilitiesChanged(entity))
		EventsSDK.on("PrepareUnitOrders", (order: ExecuteOrder): boolean => this.OnExecuteOrder(order))
	}

	private readonly sleeper: Sleeper
	private readonly menuManager: MenuManager
	private readonly guiManager: GUIManager

	public OnGameChanged(): void {
		Storage.Clear()
	}

	public OnTick(): void {
		Storage.InvalidateUnits()

		if (!this.menuManager.State.value) {
			return
		}

		this.stealAegis()
		this.stealItem()
		this.stealRune()
	}

	public OnDraw(): void {
		this.guiManager.Draw()
	}

	public OnChatEvent(type: DOTA_CHAT_MESSAGE): void {
		if (!this.menuManager.State.value) {
			return
		}

		if (type !== DOTA_CHAT_MESSAGE.CHAT_MESSAGE_ROSHAN_KILL) {
			return
		}

		if (this.shouldNotAegisBeStealed) {
			return
		}

		;[...Storage.Abilities.values()]
			.find((ability: AbilityWrap) => this.menuManager.IsAbilityEnabled(ability.Ability) && ability.CanBeCasted)
			?.UseAbilityToSpawner(Storage.RoshanInfo.Spawner!.Position)

		Storage.RoshanInfo.Entity = undefined
		Storage.RoshanInfo.IsKilled = true
	}

	public OnEntityCreated(entity: Entity): void {
		if (entity instanceof Roshan) {
			Storage.RoshanInfo.Entity = entity
		} else if (entity instanceof RoshanSpawner) {
			Storage.RoshanInfo.Spawner = entity
		} else if (entity instanceof Ability) {
			this.onAbilityCreated(entity)
		} else if (entity instanceof Hero) {
			this.onHeroCreated(entity)
		} else if (entity instanceof Unit) {
			this.onUnitCreated(entity)
		}
	}

	public OnEntityDestroyed(entity: Entity): void {
		if (entity instanceof Roshan) {
			Storage.RoshanInfo.Entity = undefined
			Storage.RoshanInfo.IsKilled = true
		} else if (entity instanceof RoshanSpawner) {
			Storage.RoshanInfo.Spawner = undefined
		} else if (entity instanceof Ability) {
			this.onAbilityDestroyed(entity)
		} else if (entity instanceof Hero) {
			this.onHeroDestroyed(entity)
		} else if (entity instanceof Unit) {
			this.onUnitDestroyed(entity)
		}
	}

	public OnParticleCreated(particle: NetworkedParticle): void {
		if (particle.Path === "particles/neutral_fx/roshan_spawn.vpcf") {
			Storage.RoshanInfo.IsKilled = false
		}
	}

	public OnUnitAbilitiesChanged(unit: Entity): void {
		if (!(unit instanceof Unit)) {
			return
		}

		unit.Spells.forEach((spell: Nullable<Ability>): void => {
			if (spell === undefined) {
				return
			}

			const isAbilityInStorage: boolean = Storage.Abilities.has(spell)

			if (!isAbilityInStorage) {
				this.onAbilityCreated(spell)
			}
		})

		Storage.Abilities.forEach((_, ability: Ability): void => {
			if (!unit.Spells.includes(ability)) {
				Storage.Abilities.delete(ability)
			}
		})
	}

	public OnUnitItemsChanged(unit: Entity): void {
		if (!(unit instanceof Unit)) {
			return
		}

		unit.Items.forEach((item: Item): void => {
			if (!Storage.Abilities.has(item)) {
				this.onAbilityCreated(item)
			}
		})
	}

	public OnExecuteOrder(order: ExecuteOrder): boolean {
		if (ExecuteOrder.DisableHumanizer) {
			return true
		}

		const orderIssuersUnits: UnitWrap[] = [...Storage.Units.values()].filter(
			(unit: UnitWrap): boolean =>
				unit.Unit.IsAlive &&
				unit.Sleeper.Sleeping(unit.moveSleeperKey) &&
				order.Issuers.some(issuer => issuer === unit.Unit)
		)

		for (const issuer of orderIssuersUnits) {
			const isEnemiesAround: boolean = Storage.Heroes.values().some(
				hero => hero.IsEnemy() && hero.IsAlive && hero.Distance(issuer.Unit) <= 4000
			)

			if (!isEnemiesAround && issuer.Sleeper.Sleeping(issuer.moveSleeperKey)) {
				return false
			}
		}

		if (!order.IsPlayerInput) {
			return true
		}

		if (order.OrderType === dotaunitorder_t.DOTA_UNIT_ORDER_DROP_ITEM && order.Ability_ instanceof Ability) {
			Storage.IgnoredItems.add(order.Ability_.Index)
		} else if (
			order.OrderType === dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_ITEM &&
			order.Target instanceof PhysicalItem &&
			order.Target.Item !== undefined
		) {
			Storage.IgnoredItems.delete(order.Target.Item.Index)
		}

		if (order.OrderType === dotaunitorder_t.DOTA_UNIT_ORDER_PICKUP_RUNE && order.Target instanceof Rune) {
			if (!Storage.IgnoredRunes.has(order.Target)) {
				Storage.IgnoredRunes.add(order.Target)
			}
		} else {
			Storage.IgnoredRunes.clear()
		}

		return true
	}

	private onAbilityCreated(ability: Ability): void {
		if (ability.IsPassive || ability.Owner === undefined) {
			return
		}

		if (
			!this.menuManager.IsAbilityEnabled(ability) ||
			!ability.Owner.IsControllable ||
			Storage.Abilities.has(ability)
		) {
			return
		}

		if (ability instanceof antimage_blink || ability instanceof queenofpain_blink) {
			Storage.Abilities.set(ability, new BlinkAbilityWrap(ability, this.sleeper))
		} else if (ability instanceof ember_spirit_sleight_of_fist) {
			Storage.Abilities.set(ability, new SleightOfFistAbilityWrap(ability, this.sleeper))
		} else if (ability instanceof pangolier_swashbuckle) {
			Storage.Abilities.set(ability, new SwashbuckleAbilityWrap(ability, this.sleeper))
		} else {
			Storage.Abilities.set(ability, new AbilityWrap(ability, this.sleeper))
		}
	}

	private onAbilityDestroyed(ability: Ability): void {
		if (ability.Owner === undefined) {
			return
		}

		if (
			!ability.Owner.IsControllable ||
			!this.menuManager.Abilities.values.includes(ability.Name) ||
			!Storage.Abilities.has(ability)
		) {
			return
		}

		Storage.Abilities.delete(ability)
	}

	private onUnitCreated(unit: Unit): void {
		if (!unit.IsControllable || Storage.Units.has(unit)) {
			return
		}

		if (unit.IsMyHero) {
			Storage.Units.set(unit, new UnitWrap(unit))
		}

		if (unit instanceof npc_dota_hero_arc_warden) {
			Storage.Units.set(unit, new ArcWardenUnitWrap(unit))
		} else if (unit instanceof npc_dota_hero_meepo) {
			Storage.Units.set(unit, new MeepoUnitWrap(unit))
		} else if (unit instanceof SpiritBear) {
			Storage.Units.set(unit, new SpiritBearUnitWrap(unit))
		}
	}

	private onUnitDestroyed(unit: Unit): void {
		if (!unit.IsControllable || !Storage.Units.has(unit)) {
			return
		}

		Storage.Units.delete(unit)
	}

	private onHeroCreated(hero: Hero): void {
		if (!hero.IsMyHero || Storage.Heroes.has(hero)) {
			return
		}

		Storage.Heroes.add(hero)
		this.onUnitCreated(hero)
	}

	private onHeroDestroyed(hero: Hero): void {
		Storage.Heroes.delete(hero)
	}

	private stealAegis(): void {
		if (Storage.RoshanInfo.Entity === undefined || this.shouldNotAegisBeStealed) {
			return
		}

		Storage.Abilities.values()
			.find(
				(ability: AbilityWrap): boolean => this.menuManager.IsAbilityEnabled(ability.Ability) && ability.CanBeCasted
			)
			?.UseAbility(Storage.RoshanInfo.Entity, Storage.RoshanInfo.Spawner!.Position)
	}

	private get shouldNotAegisBeStealed(): boolean {
		if (Storage.RoshanInfo.IsKilled || Storage.RoshanInfo.Spawner === undefined) {
			return false
		}

		const roshanPos: Vector3 = Storage.RoshanInfo.Entity?.Position ?? Storage.RoshanInfo.Spawner.Position

		const aliveHeroesArray: Hero[] = [...Storage.Heroes.values()].filter(hero => hero.IsAlive)

		return (
			(Storage.RoshanInfo.Entity?.IsVisible ?? false) &&
			aliveHeroesArray.some(
				(hero: Hero): boolean => hero.IsAlive && hero.IsEnemy() && hero.Distance(roshanPos) <= 1500
			) &&
			aliveHeroesArray.some((hero: Hero): boolean => hero.IsAlive && !hero.IsEnemy() && hero.Distance(roshanPos) <= 800)
		)
	}

	private stealRune(): void {
		if (!this.menuManager.Runes.State.value) {
			return
		}

		const runes: Rune[] = EntityManager.GetEntitiesByClass(Rune).filter(
			(rune: Rune): boolean => !this.sleeper.Sleeping(rune.Index) && !Storage.IgnoredRunes.has(rune)
		)

		for (const rune of runes) {
			if (this.menuManager.Runes.Types.SelectedID === 1 && rune.Type !== DOTA_RUNES.DOTA_RUNE_BOUNTY) {
				continue
			}

			if (this.menuManager.Runes.Types.SelectedID === 2 && rune.Type === DOTA_RUNES.DOTA_RUNE_BOUNTY) {
				continue
			}

			Storage.Units.forEach((unit: UnitWrap): void => {
				const nearestUnit = [...Storage.Heroes]
					.filter((hero: Hero) => hero.IsAlive && hero.IsEnemy() && hero.IsVisible && hero.Distance(rune) <= 163)
					.orderBy((hero: Hero) => hero.Distance(rune))[0]

				if (nearestUnit !== undefined && !unit.Unit.IsInvisible) {
					Storage.Abilities.values()
						.find((wrap: AbilityWrap) => this.menuManager.Runes.IsAbilityEnabled(wrap.Ability) && wrap.CanBeCasted)
						?.UseAbility(nearestUnit, rune.Position, true)
				}

				if (unit.CanPickRune(rune)) {
					unit.Pick(rune)
					this.sleeper.Sleep(rune.Index, Math.randomRange(0.133, 0.2))
					Storage.IgnoredRunes.delete(rune)
				}
			})
		}
	}

	private stealItem(): void {
		const items: PhysicalItem[] = EntityManager.GetEntitiesByClass(PhysicalItem)
			.filter(
				(item: PhysicalItem): boolean =>
					item.Item !== undefined &&
					this.menuManager.IsItemEnabled(item) &&
					!Storage.IgnoredItems.has(item.Item.Index) &&
					!this.sleeper.Sleeping(item.Index)
			)
			.orderByDescending(item => item instanceof item_aegis)

		items.forEach((item: PhysicalItem): void => {
			Storage.Units.forEach((unit: UnitWrap): void => {
				if (!unit.CanPickItem(item)) {
					return
				}

				unit.Pick(item)
				this.sleeper.Sleep(Math.randomRange(0.133, 0.2), item.Index)
			})
		})
	}
})()
