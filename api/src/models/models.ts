// create type trans_cat as enum ('withdrawal', 'deposit');
export type TransCat = 'withdrawal' | 'deposit';
export type TransStatus = 'pending' | 'posted';

// drop table if exists transactions;
// create table transactions(
//  date TIMESTAMP NOT NULL,
//  memo VARCHAR NOT NULL,
// 	amount VARCHAR NOT NULL,
// 	category VARCHAR  NOT NULL,
//  status VARCHAR NOT NULL,
//  transferred BOOLEAN NOT NULL,
//  line_item_id VARCHAR  NOT NULL,
//  line_item_balance VARCHAR NOT NULL,
//  transfer_id VARCHAR,
//  pay_day_id VARCHAR,
//  user_id VARCHAR NOT NULL,
// 	id VARCHAR PRIMARY KEY);
export function getDate() {
  return new Date();
}

export interface Transaction {
  date: Date,
  memo: string,
  amount: number,
  category: TransCat,
  status: TransStatus,
  transferred: boolean,
  line_item_id: string,
  line_item_balance?: number,
  transfer_id?: string,
  pay_day_id?: string,
  user_id?: string,
  id?: string
}

// drop table if exists line_items;
// create table line_items(
//   name VARCHAR UNIQUE NOT NULL,
//   balance VARCHAR DEFAULT '0',
//   category_id VARCHAR NOT NULL,
//   user_id VARCHAR NOT NULL,
//   id VARCHAR PRIMARY KEY);
export interface LineItem {
  name: string,
  balance: number,
  category_id: string,
  budget?: number,
  transactions?: Transaction[],
  deposits?: PayDayDeposit[],
  userId?: string,
  id?: string
}

// drop table if exists line_item_categories;
// create table line_item_categories(
//   name VARCHAR UNIQUE NOT NULL,
//   user_id VARCHAR NOT NULL,
//   id VARCHAR PRIMARY KEY);
export interface LineItemCategory {
  name: string,
  lineItems?: LineItem[],
  userId?: string,
  id?: string,
}

export interface Transfer {
  memo: string,
  from: string,
  to: string,
  amount: number
}

export interface Results<T> { status: number, body: T | string }

// drop table if exists users cascade;
// create table users(
//   name VARCHAR UNIQUE NOT NULL,
//   password VARCHAR NOT NULL,
//   id VARCHAR PRIMARY KEY
// );
export interface User {
  name: string,
  password: string,
  id?: string
}

// drop table if exists pay_days;
// create table pay_days(
//   name VARCHAR UNIQUE NOT NULL,
//   user_id VARCHAR NOT NULL,
//   id VARCHAR PRIMARY KEY
// );
export interface PayDay {
  name: string,
  deposits?: PayDayDeposit[],
  total?: number,
  userId?: string,
  id?: string
}

// drop table if exists pay_day_deposits;
// create table pay_day_deposits (
//   amount VARCHAR NOT NULL,
//   line_item_id VARCHAR NOT NULL,
//   pay_day_id VARCHAR NOT NULL,
//   user_id VARCHAR NOT NULL,
//   id VARCHAR PRIMARY KEY
// );
export interface PayDayDeposit {
  amount: number,
  lineItemId: string,
  payDayId: string,
  name?: string,
  userId?: string,
  id?: string
}