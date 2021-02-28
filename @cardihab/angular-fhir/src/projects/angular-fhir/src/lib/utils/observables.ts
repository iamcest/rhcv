import { Observable, ReplaySubject } from 'rxjs';

export function observableToReplaySubject<T>(observable: Observable<T>, history?: number): ReplaySubject<T> {
  const subject = new ReplaySubject<T>(history || 1);
  observable.subscribe(subject);
  return subject;
}
