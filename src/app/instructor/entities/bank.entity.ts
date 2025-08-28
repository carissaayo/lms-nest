import { User } from 'src/app/user/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('banks')
export class Bank {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.banks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'instructor_id' })
  instructor!: User;

  @Column()
  bankName!: string;

  @Column()
  accountNumber!: string;

  @Column()
  accountName!: string;

  @Column()
  bankCode!: string; // needed by Paystack/Flutterwave

  @CreateDateColumn()
  createdAt!: Date;
}
