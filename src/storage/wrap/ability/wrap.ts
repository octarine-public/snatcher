import { Ability, Sleeper, Unit, Vector3 } from "github.com/octarine-public/wrapper/index"

export class AbilityWrap {
	constructor(
		public readonly Ability: Ability,
		protected readonly Sleeper: Sleeper
	) {
		this.Owner = this.Ability.Owner!
	}

	public readonly Owner: Nullable<Unit>
	protected readonly SleepTime: number = 0.133

	public get CanBeCasted(): boolean {
		return this.Ability.IsValid && this.Ability.CanBeCasted() && !this.Sleeper.Sleeping(this.SleeperKey)
	}

	protected get SleeperKey(): string {
		return `ability-${this.Ability.Handle}`
	}

	public UseAbility(unit: Unit, spawner: Vector3, isIgnoreDamage: boolean = false): void {
		if (this.Owner === undefined || this.Sleeper.Sleeping(this.SleeperKey)) {
			return
		}

		const pos: Vector3 = unit.IsVisible ? unit.Position : spawner

		if (
			this.Owner.Distance(pos) > this.Ability.CastRange ||
			(!isIgnoreDamage && this.Ability.GetDamage(unit) < unit.HP)
		) {
			return
		}

		this.Owner.CastPosition(this.Ability, pos)
		this.Sleeper.Sleep(this.SleepTime, this.SleeperKey)
	}

	public UseAbilityToSpawner(spawner: Vector3) {
		if (this.Owner === undefined || this.Owner.Distance(spawner) > this.Ability.CastRange) {
			return
		}

		this.Owner.CastPosition(this.Ability, spawner)
		this.Sleeper.Sleep(this.SleepTime, this.SleeperKey)
	}
}
