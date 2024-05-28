import {AfterContentInit, Component, ElementRef, EventEmitter, OnDestroy, ViewChild} from '@angular/core';
import {BpmnPropertiesPanelModule, BpmnPropertiesProviderModule,} from 'bpmn-js-properties-panel';
import Modeler from 'bpmn-js/lib/Modeler';
import customPropertiesProvider from '../custom-properties-provider/custom-property-provider';
import {from, Observable} from 'rxjs';
import {saveAs} from "file-saver";

const custom = require('../custom-properties-provider/descriptors/custom.json');

/**
 * You may include a different variant of BpmnJS:
 *
 * bpmn-viewer  - displays BPMN diagrams without the ability
 *                to navigate them
 * bpmn-modeler - bootstraps a full-fledged BPMN editor
 */
const BpmnJS = require('bpmn-js/dist/bpmn-modeler.production.min.js');

@Component({
  selector: 'app-diagram',
  templateUrl: 'diagram.component.html',
  styleUrls: [
   'diagram.component.css'
  ]
})
export class DiagramComponent implements AfterContentInit, OnDestroy {

  // instantiate BpmnJS with component
  private bpmnJS: Modeler;

  // retrieve DOM element reference
  @ViewChild('diagramRef', { static: true }) private diagramRef: ElementRef | undefined;
  @ViewChild('propertiesRef', { static: true }) private propertiesRef: ElementRef | undefined;

  private xml: string = `<?xml version="1.0" encoding="UTF-8"?>
  <bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xsi:schemaLocation="http://www.omg.org/spec/BPMN/20100524/MODEL BPMN20.xsd" id="sample-diagram" targetNamespace="http://bpmn.io/schema/bpmn">
    <bpmn2:process id="Process_1" isExecutable="false">
      <bpmn2:startEvent id="StartEvent_1"/>
    </bpmn2:process>
    <bpmndi:BPMNDiagram id="BPMNDiagram_1">
      <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
        <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
          <dc:Bounds height="36.0" width="36.0" x="412.0" y="240.0"/>
        </bpmndi:BPMNShape>
      </bpmndi:BPMNPlane>
    </bpmndi:BPMNDiagram>
  </bpmn2:definitions>`;

  fileName: any = '';

  fileLoadedFile: EventEmitter<any> = new EventEmitter();

  constructor() {
    this.bpmnJS = new Modeler({
      container: this.diagramRef?.nativeElement,
      propertiesPanel: {
        parent: this.propertiesRef
      },
      additionalModules: [
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        customPropertiesProvider
      ],
      moddleExtensions: {
        custom: custom
      }
    })
  }

  ngAfterContentInit(): void {
    // attach BpmnJS instance to DOM element
    this.bpmnJS.attachTo(this.diagramRef!.nativeElement);

    const propertiesPanel =this.bpmnJS.get('propertiesPanel');

    // @ts-ignore
    propertiesPanel.attachTo(this.propertiesRef!.nativeElement);
    this.importDiagram(this.xml);
  }


  ngOnDestroy(): void {
    // destroy BpmnJS instance
    this.bpmnJS.destroy();
  }

  /**
   * Creates a Promise to import the given XML into the current
   * BpmnJS instance, then returns it as an Observable.
   */
  private importDiagram(xml: string): Observable<{warnings: Array<any>}> {
    return from(this.bpmnJS.importXML(xml) as Promise<{warnings: Array<any>}>);
  }

  save() {
    this.bpmnJS?.saveXML().then((result) => {

      const str = result.xml
      if (str !== undefined) {

        // Save in pretty format

        const blob = new Blob([this.prettifyXml(str)], {type: 'text/xml'});
        var fileName = 'model.bpmn'
        if (this.fileName !== undefined) {
          fileName = this.fileName.split(/(\\|\/)/g).pop()
        }
        saveAs(blob, fileName);


      }

    }).catch(function(err) {

      console.log(err);
    });
  }

  new() {
    this.importDiagram(this.xml)
    console.log(this.fileName)
    this.fileName = ''
  }

  convert() {

  }

  onFileSelected(event: any) {

    const file:File = event.target.files[0];

    if (file) {

      if (file instanceof File) {

        const reader = new FileReader();
        reader.readAsBinaryString(file);
        this.fileLoadedFile.subscribe((data: any) => {
            this.importDiagram(data)
          }
        );
        const me = this;
        reader.onload = (event: Event) => {
          if (reader.result instanceof ArrayBuffer) {
            ///console.log('array buffer');

            // @ts-ignore
            me.fileLoaded.emit(String.fromCharCode.apply(null, reader.result));
          } else {
            // console.log('not a buffer');
            if (reader.result !== null) me.fileLoadedFile.emit(reader.result);
          }
        };
        reader.onerror = function (error) {
          console.log('Error: ', error);
       //   me.openAlert('Alert','Failed to process file. Try smaller example?')
        };
      }

    }
  }

  prettifyXml(sourceXml)
  {
    var xmlDoc = new DOMParser().parseFromString(sourceXml, 'application/xml');
    var xsltDoc = new DOMParser().parseFromString([
      // describes how we want to modify the XML - indent everything
      '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
      '  <xsl:strip-space elements="*"/>',
      '  <xsl:template match="para[content-style][not(text())]">', // change to just text() to strip space in text nodes
      '    <xsl:value-of select="normalize-space(.)"/>',
      '  </xsl:template>',
      '  <xsl:template match="node()|@*">',
      '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
      '  </xsl:template>',
      '  <xsl:output indent="yes"/>',
      '</xsl:stylesheet>',
    ].join('\n'), 'application/xml');

    var xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltDoc);
    var resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    var resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
  };
}
