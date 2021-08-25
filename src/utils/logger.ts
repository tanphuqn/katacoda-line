import { constant } from './constant'

export default class Logger {
  private prefix = '';

  public setPrefix(prefix: string) {
    this.prefix = prefix;
  }

  public log(type: string, message: any = '') {
    console.log(`%c[Camach Line] ${type}`, constant.console_color, message);
  }

  public warn(type: string, message: any = '') {
    console.warn(`%c[Camach Line WARNING] ${type}`, constant.console_color_warning, message);
  }

  public debug(value: any, args1: any = '', args2: any = '') {
    const msg = this.prefix ? `${this.prefix}: ${value}` : value;
    console.debug(`%c[Camach Line DEBUG]`, constant.console_color_warning, msg, args1, args2);
  }
}
