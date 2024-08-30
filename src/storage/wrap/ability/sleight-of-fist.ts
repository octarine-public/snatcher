import { Unit, Vector3 } from "github.com/octarine-public/wrapper/index"

import { AbilityWrap } from "./wrap"

export class SleightOfFistAbilityWrap extends AbilityWrap {
	public UseAbility(unit: Unit, spawner: Vector3, ignoreRoshanDmg = false) {
		if (this.Owner === undefined || this.Sleeper.Sleeping(this.SleeperKey)) {
			return
		}
		const position = unit.IsVisible
			? unit.Position.Extend2D(this.Owner.Position, this.Ability.AOERadius - 100)
			: spawner.Extend2D(this.Owner.Position, this.Ability.AOERadius - 100)

		if (this.Owner.Distance(unit.Position) > this.Ability.CastRange) {
			return
		}

		if (!ignoreRoshanDmg && this.Ability.GetDamage(unit) / 2 < unit.HP) {
			return
		}

		this.Owner.CastPosition(this.Ability, !ignoreRoshanDmg ? spawner : position)
		this.Sleeper.Sleep(this.SleepTime, this.SleeperKey)
	}
}
