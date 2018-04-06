import { Component, ViewChild } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Chart } from 'chart.js';
import moment from 'moment-timezone';
import 'rxjs/add/operator/toPromise';
import { LoadingController } from 'ionic-angular';
import { prototype } from 'long';
declare var window: any;
declare var PDFView: any;
declare var canvas: any;
import __pdfjs from 'pdfjs-dist/build/pdf';
import PDFJSAnnotate from 'pdf-annotate';
//import MyStoreAdapter from './myStoreAdapter';
declare var window: any;
declare var TextEncoder: any;

/// Pdf js basic example - https://jsfiddle.net/pdfjs/cq0asLqz/?utm_source=website&utm_medium=embed&utm_campaign=cq0asLqz
/// Annotations sample - http://jsfiddle.net/seikichi/RuDvz/2/
@Component({
    selector: 'page-home',
    templateUrl: 'home.html'
})
export class HomePage {



    constructor(public navCtrl: NavController,
        public loadingCtrl: LoadingController,

    ) {

    }

    ionViewDidLoad() {
        var self = this;

        document.querySelector('.readBytesButtons').addEventListener('click', function (evt: any) {
            if (evt.target.tagName.toLowerCase() == 'button') {
                var startByte = evt.target.getAttribute('data-startbyte');
                var endByte = evt.target.getAttribute('data-endbyte');
                var opt_startByte = startByte;
                var opt_stopByte = endByte;
                var files = (<any>document).getElementById('files').files;
                if (!files.length) {
                    alert('Please select a file!');
                    return;
                }
                var file = files[0];
                var start = parseInt(opt_startByte) || 0;
                var stop = parseInt(opt_stopByte) || file.size - 1;

                var reader = new FileReader();
                // If we use onloadend, we need to check the readyState.
                reader.onloadend = function (evt) {
                    if ((<any>evt).target.readyState == (<any>FileReader).DONE) {  
                        document.getElementById('byte_content').textContent = (<any>evt).target.result;
                        document.getElementById('byte_range').textContent =
                            ['Read bytes: ', start + 1, ' - ', stop + 1,
                                ' of ', file.size, ' byte file'].join('');
                    }
                };

                var blob = file.slice(start, stop + 1);
                //reader.readAsBinaryString(blob);
                reader.onload = function () {
                    var arraybuffer = this.result;
                    var pdfData = new Uint8Array(arraybuffer);
                    self.savePdfAsString(pdfData);
                    self.createPdf(pdfData);
                };
                reader.readAsArrayBuffer(blob);
            }
        }, false);

    }

    createPdf(pdfData) {
        // Loaded via <script> tag, create shortcut to access PDF.js exports.
        var pdfjsLib = window['pdfjs-dist/build/pdf'];

        pdfjsLib.workerSrc = '//mozilla.github.io/pdf.js/build/pdf.worker.js';
        PDFJSAnnotate.setStoreAdapter(new PDFJSAnnotate.LocalStoreAdapter());

        var loadingTask = pdfjsLib.getDocument({ data: pdfData });

        loadingTask.promise.then(function (pdf) {
            console.log('PDF loaded');
            var pageNumber = 1;
            pdf.getPage(pageNumber).then(function (page) {
                console.log('Page loaded');
                var scale = 1.5;
                var viewport = page.getViewport(scale);

                // Prepare canvas using PDF page dimensions
                var canvas = document.getElementById('the-canvas');
                var context = (<any>canvas).getContext('2d');
                (<any>canvas).height = viewport.height;
                (<any>canvas).width = viewport.width;

                // Render PDF page into canvas context
                var renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                var renderTask = page.render(renderContext);
                renderTask.then(function () {
                    console.log('Page rendered');
                });
            });

        }, function (reason) {
            // PDF loading error
            console.error(reason);
        });
    }

    savePdfAsString(pdf) {
        this.largeuint8ArrToString(pdf, (strPdf) => {
            var base64StringPdf = btoa(strPdf);
            localStorage.setItem("pdfStr", base64StringPdf);
        });
    }

    getPdfFromString(base64PdfString){
        // decode base64 string, remove space for IE compatibility
        var binary = atob(base64PdfString.replace(/\s/g, ''));
        var len = binary.length;
        var arraybuffer = new ArrayBuffer(len);
        var pdfData = new Uint8Array(arraybuffer);
    }

    largeuint8ArrToString(uint8arr, callback) {
        var bb = new Blob([uint8arr]);
        var f = new FileReader();
        f.onload = function (e) {
            callback((<any>e).target.result);
        };
        f.readAsBinaryString(bb);
    }

}


