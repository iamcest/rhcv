import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from '../services/storage-service';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.css']
})
export class RootComponent implements OnInit {

  constructor(private router: Router, private storageService: StorageService) { }

  ngOnInit() {
    const region = this.storageService.get({key: 'preferred.region'});
    this.router.navigate([region || 'au', 'home']);
  }

}
