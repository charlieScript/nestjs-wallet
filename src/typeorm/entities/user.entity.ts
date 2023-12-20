import { Column, Entity } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Base } from '../utils';

@Entity()
export class User extends Base {
  @Column()
  username: string;

  @Column()
  @Exclude()
  passwordHash: string;

  @Column({ nullable: true })
  @Exclude()
  pin: string;

  @Column({ default: false })
  @Exclude()
  merchantActive: boolean;

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }
}
