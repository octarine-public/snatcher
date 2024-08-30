import { Ability, Hero, Roshan, RoshanSpawner, Rune, Unit } from "github.com/octarine-public/wrapper"

import { AbilityWrap } from "./wrap/ability/wrap"
import { UnitWrap } from "./wrap/unit/wrap"

export interface RoshanInfo {
	Entity: Nullable<Roshan>
	Spawner: Nullable<RoshanSpawner>
	IsKilled: boolean
}

export class Storage {
	public static readonly Units: Map<Unit, UnitWrap> = new Map<Unit, UnitWrap>()
	public static readonly Abilities: Map<Ability, AbilityWrap> = new Map<Ability, AbilityWrap>()
	public static readonly Heroes: Set<Hero> = new Set<Hero>()
	public static readonly IgnoredRunes: Set<Rune> = new Set<Rune>()
	public static readonly IgnoredItems: Set<number> = new Set<number>()

	public static readonly RoshanInfo: RoshanInfo = {
		Entity: undefined,
		Spawner: undefined,
		IsKilled: false
	}

	public static Clear(): void {
		this.Units.clear()
		this.Abilities.clear()
		this.Heroes.clear()
		this.IgnoredRunes.clear()
		this.IgnoredItems.clear()

		this.RoshanInfo.Entity = undefined
		this.RoshanInfo.Spawner = undefined
		this.RoshanInfo.IsKilled = false
	}

	public static InvalidateUnits(): void {
		this.invalidateSet<Unit, UnitWrap, boolean>(this.Units, u => u.IsValid)
	}

	private static invalidateSet<T extends object, D, R>(set: Map<T, D>, path: (elem: T) => R): void {
		if (set.size === 0) {
			return
		}

		set.forEach((_, obj: T): void => {
			if (!path(obj)) {
				set.delete(obj)
			}
		})
	}
}
