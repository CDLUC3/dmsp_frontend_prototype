import logECS from '@/utils/clientLogger';


export interface LoggedErrorProps {
    status: number | null;
    message: string;
    source: string;
}

export class LoggedError extends Error {
  status: number | null;

  constructor({status, message, source}: LoggedErrorProps) {
    let statusMsg: string;
    if (status) {
      statusMsg = `[${status}] ${message}`;
    } else {
      statusMsg = message;
    }
    super(statusMsg);

    this.status = status;
    this.message = message;

    logECS(
      'error',
      statusMsg,
      { source },
    );
  }
}
