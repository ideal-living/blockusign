import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, BlockerDelegate, ModalController, AlertCmp, AlertController } from 'ionic-angular';
import { DocumentService } from './../../services/document.service';
import { BlockStepsComponent } from '../../components/block-steps/block-steps';
import { BitcoinService } from '../../services/bitcoin.service';
import { BlockStackService } from '../../services/blockstack.service';
import { Block } from 'bitcoinjs-lib';
import { VideoComponent } from '../../components/video/video';
import { VideoModalPage } from '../video-modal/video-modal';
declare let window: any;
declare let blockstack: any;

/**
 * Generated class for the SignPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage({
  name: 'ReviewPage',
  segment: 'review/:guid',
  defaultHistory: ['SignPage', 'EmailPage', 'AnnotatePage', 'HomePage']
})
@Component({
  selector: 'page-review',
  templateUrl: 'review.html',
})
export class ReviewPage {

  hash = "";
  @ViewChild("blockSteps") blockSteps: BlockStepsComponent;
  @ViewChild(VideoComponent) videoEL: VideoComponent;
  collaborators = [];
  showVideo = false;
  isSafari = false;
  name = "";

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public documentService: DocumentService,
    private bitcoinService: BitcoinService,
    public blockstackService: BlockStackService,
    private nav: NavController,
    private change: ChangeDetectorRef,
    public modal: ModalController,
    public alertCtrl: AlertController
  ) { }


  ionViewDidLoad() {
    this.isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    this.init();
  }

  async init() {

    // if you are a signer and the document is not in your document.index then add it!
    if (this.navParams.get("guid") && !this.documentService.currentDoc) {
      let guid = this.navParams.get("guid");
      await this.documentService.getDocumentsIndex(true).then(async (data) => {
        this.documentService.documentsList = data;
        await this.documentService.setCurrentDoc(guid);
        await this.documentService.getAnnotations(guid);
        this.getHash();
      });

    }
    else {
      let guid = this.navParams.get("guid");
      await this.documentService.getAnnotations(guid);
      this.getHash();
    }

    this.name = blockstack.loadUserData().username;

    try {
      if (localStorage.getItem('showVideo') == "true") {
        console.log('get video now!');
        this.toggleVideoStoryHead(this.blockstackService.userId);
        setTimeout(() => {
          localStorage.setItem('showVideo', "false");
        }, 3000)
      }
    } catch (e) {
      console.log('toggle head errer', e)
    }


  }



  back() {
    // this.navCtrl.push("SignPage", {
    //   guid: this.documentService.currentDoc.guid
    // });
    this.blockSteps.route("SignPage");
  }

  next() {
    // this.navCtrl.push("SignPage", {
    //   guid: this.documentService.currentDoc.guid
    // });
    this.blockSteps.route("BlockchainPage");
  }

  async getHash() {
    try {
      this.hash = await this.documentService.getMerkleHash();
      this.getCollaborators();
    }
    catch (e) {
      console.log('cannot get hash', e)
      let alert = this.alertCtrl.create({
        title: '',
        subTitle: 'Please make sure you signed and saved the document. You might need to go back to the "e-sign" page',
        buttons: [
          {
            text: 'Ok',
            handler: data => {
              if (true == true) {
              } else {
                // invalid login
                return false;
              }
            }
          }
        ]
      });
      alert.present();
    }


  }

  postBlockchain() {
    this.nav.push('BlockchainPage', {
      guid: this.documentService.currentDoc.guid
    });
  }

  async getCollaborators() {
    this.collaborators = await this.documentService.getCollaborators(this.documentService.currentDoc.guid);
    let a = 1;
  }

  async getVideoR(path) {
    console.log('git vid');
    this.showVideo = true;
    this.change.detectChanges();

    // await this.videoEL.getVideo(path);

    const modal = this.modal.create(VideoModalPage, { videoPath: path }, { enableBackdropDismiss: false });
    modal.present();
  }

  toggleVideoStoryHead(userId) {
    let path = null;
    if (userId == blockstack.loadUserData().username) {
      path = this.documentService.docStorageMaps.storagePaths.find(u => u == this.blockstackService.getStoragePath());
    } else {
      path = this.documentService.docStorageMaps.storagePaths.find(u => u != this.blockstackService.getStoragePath());
    }
    this.getVideoR(path);
  }

  hideVideo() {
    this.showVideo = false;
  }



}
