import { AgePipe } from './age.pipe';

describe('AgePipe', () => {
  it('create an instance', () => {
    const pipe = new AgePipe();
    expect(pipe).toBeTruthy();
  });

  it('handle empty DoB', () => {
    const pipe = new AgePipe();
    expect(pipe.transform(void 0)).toEqual(void 0);
  });
});
