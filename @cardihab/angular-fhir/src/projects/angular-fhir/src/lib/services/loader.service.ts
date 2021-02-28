import { Injectable, Injector } from '@angular/core';
import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { LoaderComponent, CONTAINER_DATA } from '../loader/loader.component';

@Injectable()
export class LoaderService {

  overlayRef: OverlayRef;
  overlayConfig: OverlayConfig = new OverlayConfig();

  constructor(private overlay: Overlay, private injector: Injector) {
    this.overlayConfig.positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();
    this.overlayConfig.hasBackdrop = true;
  }

  start(message: string = '') {
    this.overlayRef = this.overlay.create(this.overlayConfig);
    const containerPortal = new ComponentPortal(LoaderComponent, null, this.createInjector({
      message
    }));
    this.overlayRef.attach(containerPortal);
  }

  stop() {
    this.overlayRef.dispose();
  }

  private createInjector(dataToPass: {}): PortalInjector {
    const injectorTokens = new WeakMap();
    injectorTokens.set(CONTAINER_DATA, dataToPass);
    return new PortalInjector(this.injector, injectorTokens);
  }
}
