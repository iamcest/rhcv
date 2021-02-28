import { Observable, ReplaySubject } from 'rxjs';
export declare function observableToReplaySubject<T>(observable: Observable<T>, history?: number): ReplaySubject<T>;
