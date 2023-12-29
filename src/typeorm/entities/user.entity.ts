import { Column, Entity, Unique } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Base } from '../utils';

@Entity()
@Unique(['email'])
export class User extends Base {
  @Column()
  email: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column({ nullable: true })
  @Exclude()
  pin: string;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
