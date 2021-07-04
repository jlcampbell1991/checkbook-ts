class Logger {
  private formatMessage(level: string, msg: string): string {
    return `[${level}] ${msg}`;
  }

  debug(msg: string): void { console.debug(this.formatMessage('DEBUG', msg)) }
  error(msg: string): void { console.error(this.formatMessage('ERROR', msg)) }
  info(msg: string): void  { console.log(this.formatMessage('INFO', msg))    }
}

export default Logger;

