import { HttpClient } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  AudioVideoObserver,
  ConsoleLogger,
  DefaultDeviceController,
  DefaultMeetingSession,
  DeviceChangeObserver,
  LogLevel,
  MeetingSessionConfiguration,
  MeetingSessionStatus,
  MeetingSessionStatusCode,
  MeetingSessionVideoAvailability,
  VideoTileState
} from 'amazon-chime-sdk-js';
import { Attendee, Meeting } from 'aws-sdk/clients/chime';
import { FhirService } from 'src/app/services/fhir.service';
import { PractitionerService } from 'src/app/services/practitioner.service';
import { v4 as uuid} from 'uuid';
import * as moment from 'moment';
import { BehaviorSubject, Subject } from 'rxjs';
import { RegionalConfigService } from '@cardihab/angular-fhir';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';

enum CallStatus {
  NO_DEVICE = 'No Device',
  AVAILABLE = 'Available',
  CALLING = 'Calling',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  NO_ANSWER = 'No Answer',
  CALL_ENDED = 'Call Ended',
  DROPPED = 'Call Dropped',
  FAILED = 'Call Failed',
  CLEAN_UP = 'Clean up'
}

@Component({
  selector: 'app-telehealth',
  templateUrl: './telehealth.component.html',
  styleUrls: ['./telehealth.component.scss']
})
export class TelehealthComponent implements OnInit, AudioVideoObserver, DeviceChangeObserver {
  CallStatusType = CallStatus;

  meetingSession;
  audioVideo;
  canStartLocalVideo;
  meetingTitle;
  localTileHeight = '128px';
  localTileWidth = '128px';
  tileWidth = '256px';
  tileHeight = '256px';

  videoCam = true;
  muted = false;

  callStatus$: Subject<CallStatus> = new BehaviorSubject(CallStatus.NO_DEVICE);
  previousStatus = CallStatus.NO_DEVICE;

  callForm: FormGroup;
  ringtone: HTMLAudioElement;

  @Input()
  patient: fhir.Patient;

  patientDevice: fhir.Device;

  @ViewChild('videoMe')
  videoOutputMe;

  @ViewChild('videoOther')
  videoOutputOther;

  request: fhir.CommunicationRequest;
  joinInfo: {
    Meeting: {
      Meeting: Attendee,
    };
    Attendee: {
      Attendee: Attendee,
    };
  };

  attendee$ = new Subject();

  constructor(
    private http: HttpClient,
    private formBuilder: FormBuilder,
    private practionerService: PractitionerService,
    private fhirService: FhirService,
    private regionService: RegionalConfigService,
    private snackbar: MatSnackBar
  ) {
    this.callForm = this.formBuilder.group({
      audio: '',
      video: ''
    });
  }

  async ngOnInit(): Promise<void> {
    this.callStatus$.subscribe(async status => {
      const tmpStatus = this.previousStatus;
      this.previousStatus = status;

      switch (status) {
        case CallStatus.AVAILABLE:
          console.log('Ready to call');
          break;
        case CallStatus.NO_ANSWER:
          console.log('No answer');
          this.snackbar.open('No answer');
        // tslint:disable-next-line: no-switch-case-fall-through
        case CallStatus.CALL_ENDED:
          if (this.ringtone) {
            this.ringtone.pause();
            this.ringtone = null;
          }
          this.endChimeSession();
          break;
        case CallStatus.CONNECTED:
          if (this.ringtone) {
            this.ringtone.pause();
            this.ringtone = null;
          }
        break;
        case CallStatus.CLEAN_UP:
          console.log('Call cleanup');
      }
    });
    // does this patient have a valid device record.
    if (this.patient) {
      const patientDevices = await this.fhirService.search<fhir.Device>('Device', { patient: this.patient.id}).toPromise();
      if (patientDevices.total > 0) {
        this.patientDevice = patientDevices.entry
        .sort((a, b) => moment(b.resource.meta.lastUpdated).unix() - moment(a.resource.meta.lastUpdated).unix())
        .find(deviceEntry => {
          const device = deviceEntry.resource;
          const appleOrAndroid = device.type?.coding?.[0].code;

          return appleOrAndroid &&  device.status === 'active' && device.url;
        })?.resource;

        if (this.patientDevice) {
          this.callStatus$.next(CallStatus.AVAILABLE);
        }
      }

      this.attendee$.subscribe(attendee => {
        this.callStatus$.next(CallStatus.CONNECTED);
      });
    }
  }

  async toggleVideo() {
    this.videoCam = !this.videoCam;
    if (this.previousStatus === CallStatus.CONNECTED || this.previousStatus === CallStatus.CONNECTING) {
      this.chooseCamera();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.previousStatus === CallStatus.CONNECTED || this.previousStatus === CallStatus.CONNECTING) {
      this.chooseSound();
    }
  }

  async callPatient() {
    if (this.patientDevice) {
      this.callStatus$.next(CallStatus.CALLING);
      this.ringtone = new Audio('assets/ringing.mp3');
      this.ringtone.volume = 0.5;
      this.ringtone.play();

      const practitioner = await this.practionerService.current.pipe(take(1)).toPromise();
      this.request = {
        resourceType: 'CommunicationRequest',
        status: 'draft',
        identifier: [{
          system: 'urn:uuid',
          value: uuid()
        }],
        sender: {
            reference: `Practitioner/${practitioner.id}`
        },
        subject: {
          reference: `Patient/${this.patient.id}`
        },
        recipient: [{
          reference: `Device/${this.patientDevice.id}`
        }]
      };

      const response: fhir.Bundle = await this.http.post(
        `${this.regionService.get('api').mobile}/${this.fhirService.tenancy}/CommunicationRequest`,
        this.request
      ).toPromise() as fhir.Bundle;
      console.log(response);
      if (response.entry && response.entry.length === 2) {
        this.joinInfo = response.entry[1].resource['JoinInfo'] as any;
        this.startChimeSession();

        setTimeout(() => {
          if (this.previousStatus === CallStatus.CALLING || this.previousStatus === CallStatus.CONNECTING) {
            this.callStatus$.next(CallStatus.NO_ANSWER);
          }
        }, 60000);
      }
    }
  }

  hangUp() {
    this.callStatus$.next(CallStatus.CALL_ENDED);
  }


  async endChimeSession() {
    console.log('Ending session...');
    this.callStatus$.next(CallStatus.CLEAN_UP);
    this.audioVideo.stop();
    this.audioVideo.stopLocalVideoTile();
    this.audioVideo.stopVideoPreviewForVideoInput(this.videoOutputMe.nativeElement);
    this.canStartLocalVideo = false;

    this.request.status = 'completed';
    const response = await this.http.put(
      `${this.regionService.get('api').mobile}/${this.fhirService.tenancy}/CommunicationRequest`,
      this.request
    ).toPromise();
    console.log(response);
    this.callStatus$.next(CallStatus.AVAILABLE);
  }

  async startChimeSession() {
    const logger = new ConsoleLogger('SDK', LogLevel.OFF);
    const deviceController = new DefaultDeviceController(logger);
    const configuration = new MeetingSessionConfiguration(this.joinInfo.Meeting, this.joinInfo.Attendee);


    // configuration.enableWebAudio = true;
    this.meetingSession = new DefaultMeetingSession(configuration, logger, deviceController);
    this.audioVideo = this.meetingSession.audioVideo;
    // this.meetingSession.audioVideo.setAudioProfile(AudioProfile.fullbandSpeechMono());
    // this.meetingSession.audioVideo.setContentAudioProfile(AudioProfile.fullbandSpeechMono());

    this.audioVideo.addObserver(this);

    this.audioVideo.setDeviceLabelTrigger(
      async (): Promise<MediaStream> => {
        // this.switchToFlow('flow-need-permission');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        // this.switchToFlow('flow-devices');
        return stream;
      }
    );

    // await this.audioVideo.chooseAudioInputDevice();
    // await this.audioVideo.chooseAudioOutputDevice();
    this.audioVideo.addDeviceChangeObserver(this);



    this.audioVideo.realtimeSubscribeToAttendeeIdPresence((attendeeId: string, present: boolean) => {
      console.log(`Attendee: ${attendeeId} (${present})`);
      if (attendeeId !== this.joinInfo.Attendee.Attendee.AttendeeId) {
        this.attendee$.next({attendeeId, present});
      }
    });

    this.muted = this.audioVideo.realtimeIsLocalAudioMuted();
    await this.chooseCamera();
    await this.chooseSound();
    this.audioVideo.start();
    this.callStatus$.next(CallStatus.CONNECTING);
  }

  async chooseSound() {
    const mics = await this.audioVideo.listAudioInputDevices();
    await this.audioVideo.chooseAudioInputDevice(mics[0].deviceId);
    const speakers = await this.audioVideo.listAudioOutputDevices();
    await this.audioVideo.chooseAudioOutputDevice(speakers[0].deviceId);
    await this.audioVideo.bindAudioElement(new Audio());

    if (this.muted) {
      this.audioVideo.realtimeMuteLocalAudio();
    } else {
      this.audioVideo.realtimeUnmuteLocalAudio();
    }
  }

  async chooseCamera() {
    if (this.videoCam) {
      const cameras = await this.audioVideo.listVideoInputDevices();
      const cameraDeviceIds = cameras.map((deviceInfo) => {
        return deviceInfo.deviceId;
      });
      const camera: string = cameraDeviceIds[0];
      // if (this.videoInput.value === 'None') {
      //   camera = cameraDeviceIds.length ? cameraDeviceIds[0] : 'None';
      // }
      await this.audioVideo.chooseVideoInputDevice(camera);
      this.audioVideo.startVideoPreviewForVideoInput(this.videoOutputMe.nativeElement);
      this.audioVideo.startLocalVideoTile();
    } else {
      // await this.audioVideo.chooseVideoInputDevice('None');
      this.audioVideo.stopVideoPreviewForVideoInput(this.videoOutputMe.nativeElement);
      this.audioVideo.stopLocalVideoTile();
    }
  }

  videoSizeChanged($event) {
    console.log($event);
    if ($event.target.videoHeight > $event.target.videoWidth) {
      // portrait mode
      this.tileHeight = 'unset';
      this.tileWidth = '256px';
    } else {
      this.tileWidth = 'unset';
      this.tileHeight = '256px';
    }
  }

  audioVideoDidStartConnecting(reconnecting: boolean): void {
    console.log(`session connecting. reconnecting: ${reconnecting}`);
  }

  audioVideoDidStart(): void {
    console.log('session started');
  }

  audioVideoDidStop(sessionStatus: MeetingSessionStatus): void {
    console.log(`session stopped from ${JSON.stringify(sessionStatus)}`);
    if (sessionStatus.statusCode() === MeetingSessionStatusCode.AudioCallEnded) {
      console.log(`meeting ended`);
      // @ts-ignore
      window.location = window.location.pathname;
    }
  }

  videoTileDidUpdate(tileState: VideoTileState): void {
    // console.log(`video tile updated: ${JSON.stringify(tileState, null, '  ')}`);
    if (tileState.localTile && tileState.videoStreamContentHeight && tileState.videoStreamContentWidth) {
      const myAspect = tileState.videoStreamContentWidth / tileState.videoStreamContentHeight;
      this.localTileHeight = `${128 / myAspect}px`;
    }
    if (!tileState.boundAttendeeId || tileState.localTile) {
      return;
    }

    const otherAspect = tileState.videoStreamContentWidth / tileState.videoStreamContentHeight;
    if (otherAspect > 1) {
      this.tileWidth = `${256 * otherAspect}px`;
      this.tileHeight = `256px`;
    } else {
      this.tileHeight = `${256 / otherAspect}px`;
      this.tileWidth = `256px`;
    }

    // const videoElement = document.getElementById(`video-${tileIndex}`) as HTMLVideoElement;
    // console.log(`binding video tile ${tileState.tileId} to ${videoElement.id}`);
    this.audioVideo.bindVideoElement(tileState.tileId, this.videoOutputOther.nativeElement);
    // this.tileIndexToTileId[tileIndex] = tileState.tileId;
    // this.tileIdToTileIndex[tileState.tileId] = tileIndex;
    // this.layoutVideoTiles();
  }

  videoTileWasRemoved(tileId: number): void {
    console.log(`video tile removed: ${tileId}`);
    // this.hideTile(this.tileOrganizer.releaseTileIndex(tileId));
  }

  videoAvailabilityDidChange(availability: MeetingSessionVideoAvailability): void {
    this.canStartLocalVideo = availability.canStartLocalVideo;
    console.log(`video availability changed: canStartLocalVideo  ${availability.canStartLocalVideo}`);
  }

  connectionDidBecomePoor(): void {
    console.log('connection is poor');
  }

  connectionDidSuggestStopVideo(): void {
    console.log('suggest turning the video off');
  }

  videoSendDidBecomeUnavailable(): void {
    console.log('sending video is not available');
  }

  connectionDidBecomeGood(): void {
    console.log('connection is good now');
  }

  audioInputsChanged(_freshAudioInputDeviceList: MediaDeviceInfo[]): void {
    // this.populateAudioInputList();
  }

  videoInputsChanged(_freshVideoInputDeviceList: MediaDeviceInfo[]): void {
    console.log(_freshVideoInputDeviceList);
    // this.populateVideoInputList();
  }

  audioOutputsChanged(_freshAudioOutputDeviceList: MediaDeviceInfo[]): void {
    // this.populateAudioOutputList();
  }
}
