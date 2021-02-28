import { ReplaySubject } from 'rxjs';
export function observableToReplaySubject(observable, history) {
    var subject = new ReplaySubject(history || 1);
    observable.subscribe(subject);
    return subject;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JzZXJ2YWJsZXMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9AY2FyZGloYWIvYW5ndWxhci1maGlyLyIsInNvdXJjZXMiOlsibGliL3V0aWxzL29ic2VydmFibGVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBYyxhQUFhLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFakQsTUFBTSxVQUFVLHlCQUF5QixDQUFJLFVBQXlCLEVBQUUsT0FBZ0I7SUFDdEYsSUFBTSxPQUFPLEdBQUcsSUFBSSxhQUFhLENBQUksT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ25ELFVBQVUsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDOUIsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE9ic2VydmFibGUsIFJlcGxheVN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuZXhwb3J0IGZ1bmN0aW9uIG9ic2VydmFibGVUb1JlcGxheVN1YmplY3Q8VD4ob2JzZXJ2YWJsZTogT2JzZXJ2YWJsZTxUPiwgaGlzdG9yeT86IG51bWJlcik6IFJlcGxheVN1YmplY3Q8VD4ge1xuICBjb25zdCBzdWJqZWN0ID0gbmV3IFJlcGxheVN1YmplY3Q8VD4oaGlzdG9yeSB8fCAxKTtcbiAgb2JzZXJ2YWJsZS5zdWJzY3JpYmUoc3ViamVjdCk7XG4gIHJldHVybiBzdWJqZWN0O1xufVxuIl19