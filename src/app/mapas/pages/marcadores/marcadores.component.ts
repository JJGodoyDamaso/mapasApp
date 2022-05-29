import { Component, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';

interface MarcadorColor {
  color: string;
  marker?: mapboxgl.Marker;
  centro?: [number, number]
}

@Component({
  selector: 'app-marcadores',
  templateUrl: './marcadores.component.html',
  styles: [
    `
    .mapa-container {
      height: 100%;
      width: 100%;
    }

    .list-group {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99;
    }

    li{
      cursor: pointer;
    }
    `
  ]
})
export class MarcadoresComponent implements AfterViewInit {

  @ViewChild('mapa') divMapa!: ElementRef;
  mapa!: mapboxgl.Map;
  zoomLevel: number = 15;
  center: [number, number] = [-2.443984, 36.831808];

  // arreglo de marcadores
  marcadores: MarcadorColor [] = [];

  constructor() { }

  ngAfterViewInit(): void {
    this.mapa = new mapboxgl.Map({
      container: this.divMapa.nativeElement, // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: this.center, // starting position [lng, lat]
      zoom: this.zoomLevel // starting zoom
    });
    this.leerLocalStorage();
    // const markerHTML: HTMLElement = document.createElement('div');
    // markerHTML.innerHTML = 'Hola mundo';

    // new mapboxgl.Marker({
    //   element: markerHTML
    // }).setLngLat(this.center).addTo(this.mapa);

  }

  agregarMarcador() {
    const color = "#xxxxxx".replace(/x/g, y=>(Math.random()*16|0).toString(16));

    const nMarcador = new mapboxgl.Marker({
      draggable: true,
      color
    }).setLngLat(this.center).addTo(this.mapa);

    this.marcadores.push({
        color: color,
        marker: nMarcador
    });

    this.guardarMarcadoresLocalStorage();

    nMarcador.on('dragend', () => {
      this.guardarMarcadoresLocalStorage();
    });
  }


  irMarcador(marker: mapboxgl.Marker) {
    this.mapa.flyTo({
      center: marker.getLngLat()
    })
  }


  guardarMarcadoresLocalStorage() {
    const lngLatArr: MarcadorColor[] = [];
    this.marcadores.forEach(m => {
      const color = m.color;
      const {lng,lat} = m.marker!.getLngLat();
      lngLatArr.push({
        color : color,
        centro: [lng, lat]
      });

      localStorage.setItem('marcadores', JSON.stringify(lngLatArr));
    })
  }


  leerLocalStorage() {
    if(!localStorage.getItem('marcadores')){
      return;
    }
    const lnlatArr : MarcadorColor [] = JSON.parse(localStorage.getItem('marcadores')!);
    lnlatArr.forEach(m => {
      const nMarker = new mapboxgl.Marker({
        color:m.color,
        draggable:true
      }).setLngLat(m.centro!).addTo(this.mapa);

      this.marcadores.push({
        color: m.color,
        marker: nMarker
      })

      nMarker.on('dragend', () => {
        this.guardarMarcadoresLocalStorage();
      });
    });
  }

  borrarmarcador(index: number) {
    this.marcadores[index].marker?.remove();
    this.marcadores.splice(index, 1);
    this.guardarMarcadoresLocalStorage();
  }

}


