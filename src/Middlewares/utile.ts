import moment from "moment-timezone"

export function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min)) + min
}
