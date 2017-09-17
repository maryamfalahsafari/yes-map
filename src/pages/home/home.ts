import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController,LoadingController } from 'ionic-angular';
import { Events } from 'ionic-angular';
import { AlertController } from 'ionic-angular';



import { Service } from '../../providers/service';
import { GisService } from '../../providers/gisService';

declare var google;

@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
  // styleUrls:['assets/css/style.min.css']
})
export class HomePage {

  stateList:Array<any>;

  
  
  baseStationList:Array<any>;
  baseStationGeoList:any;
  baseStationCircleList:any;


  
  ppdList:Array<any>;
  cityList:Array<any>;
  schoolList:Array<any>;
  yesList:Array<any>;
  errorMessage: string;
  filter:any={state:'',ppd:'',city:'',school:''};
  mapFilter:any = { yes:true,
                    school:true,
                    wimax:true,
                    lte:true,
                    baseStation:true,
                    yesCircle:true,
                    schoolCircle:false,
                    baseStationCircle:false
                  };
  @ViewChild('map') mapElement: ElementRef;
  @ViewChild('legend') legendElement: ElementRef;
  mapInfo:any;
  map:any;
  schoolGeoList:any;
  yesGeoList:any;
  selectedGeoSchoole:any;
  selectedSchoole:any={};
  wmFeatures:any;
  cteFeatures:any;
  columnFilter:string='SchoolCoverageStatusASN';
  serverBaseUrl='http://10.25.151.96:1030';//'http://localhost:8081'
  menuClass="animated bounceInLeft";
  showingMenu:boolean=false;
  arrow='arrow-back';
  searchPoint:any;
  yesCircleList:any;
  schoolCicleList:any;
  circleRadius:number=5;
  firstLoad = true;



  constructor(public navCtrl: NavController,
              public loadingCtrl: LoadingController,
              private _service:Service,
              private _gisService:GisService,
              private alertCtrl: AlertController
             
              ) { }
  ionViewDidLoad(){
    this.getStateList();
    this.loadMap(); 
  }
  loadMap(){
      this.mapInfo = {  lat:3.1390 , lng:101.6869, zoom: 6};
      this.map = this._gisService.loadAndReturnMap(this.mapElement,this.mapInfo);
      this.initiateLegend();

      let loader = this.loadingCtrl.create({
          content: "Loading"
      });
          
      loader.present().then(() => {
          this.map.data.setStyle({
            fillColor: '#FFF',
            strokeWeight: 1,
            strokeColor:'#0FAEF2',
            fillOpacity:0.3,
            visible: true
          });
     
          var self=this;
          this.map.data.loadGeoJson(
            this.serverBaseUrl+"/geoserver/YTLC_Geo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=YTLC_Geo:WM_ActualGoodCoverage_Public&maxFeatures=50&outputFormat=application%2Fjson", 
            null, function(features){
            self.wmFeatures=features;
            //loader.dismiss();
          });
           this.map.data.loadGeoJson(
            this.serverBaseUrl+"/geoserver/YTLC_Geo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=YTLC_Geo:WM_LTE_ActualGoodCoverge_Public&maxFeatures=50&outputFormat=application%2Fjson", 
            null, function(features){
            self.cteFeatures=features;
            loader.dismiss();
          });
      });
  }
  getStateList(){
      this._service.getStateList()
          .subscribe(result => 
          {
            if(result && result.length>0)
              {
                  this.stateList= result;
              }
          },error => this.errorMessage = <any>error,
          () => { });
  }
  //==============drpState===========
  getDataBasedOnStateId(state){
    this.clearMap();
    this._gisService.deleteMarkers(this.baseStationGeoList);
    this._gisService.deleteMarkers(this.yesGeoList);
    this._gisService.deleteMarkers(this.schoolGeoList);
    this.filter.ppd='';
    this.filter.city='';
    this.filter.school='';

    let loader = this.loadingCtrl.create({
          content: "Loading"
      });
          
      loader.present().then(() => {
        this._service.getPPDListByStateId(state.Id)
        .subscribe(result => 
        {
          if(result && result.length>0)
          {
              this.ppdList= result;
          }
        },error => this.errorMessage = <any>error,
        () => {
            this.getBaseStationList(loader,true);
           // this.getYesSchoolListByState(state.Name,loader);
           this.getAggInfo('state',this.filter.state.Name);
        });
      });

  }
  //==============drpPPD=============
  getDataBasedOnPPD(ppd){
    this.clearMap();
    this.filter.city='';
    this.filter.school='';
    if (!ppd)
        return;
    let loader = this.loadingCtrl.create({
          content: "Loading"
      });
          
      loader.present().then(() => {
        this._service.getCityListByPPDId(ppd.Id)
        .subscribe(result => 
        {
          if(result && result.length>0)
          {
              this.cityList= result;
             
          }
        },error => this.errorMessage = <any>error,
        () => {
            this.getYesSchoolDataByPPD(ppd,loader);
           this.getAggInfo('ppd',this.filter.ppd.PPDName);
        });
      });

  }
  //==============drpCity============
  getDataBasedOnCityId(cityId){
    this.clearMap();
    this.filter.school='';
    if (!cityId || cityId=='')
        return;
    let loader = this.loadingCtrl.create({
          content: "Loading"
      });
    loader.present().then(() => {
        this._service.getSchoolListByCityId(cityId)
        .subscribe(result => 
        {
          if(result && result.length>0)
          {
              this.schoolList= result;
              
          }
        },error => this.errorMessage = <any>error,
        () => {
          this.getYesSchoolDataByCityId(cityId,loader);
           this.getAggInfo('city',this.filter.city);
          
        });
      });

  }
  showFilterDialog() {
    let alert = this.alertCtrl.create();
    alert.setTitle('Which filter do you want to apply?');

    alert.addInput({
      type: 'radio',
      label: 'No of YESApp Download',
      value: 'NoofYESAppDownload',
      checked: this.columnFilter=='NoofYESAppDownload'?true:false
    });

    alert.addInput({
      type: 'radio',
      label: 'School Coverage StatusASN',
      value: 'SchoolCoverageStatusASN',
      checked: this.columnFilter=='SchoolCoverageStatusASN'?true:false
    });
    alert.addInput({
      type: 'radio',
      label: 'No Of Altitude Teachers',
      value: 'NoOfAltitudeTeachers',
      checked: this.columnFilter=='NoOfAltitudeTeachers'?true:false
    });
    alert.addInput({
      type: 'radio',
      label: 'No Of Plan Upgrade',
      value: 'NoOfPlanUpgrade',
      checked: this.columnFilter=='NoOfPlanUpgrade'?true:false
    });
    alert.addInput({
      type: 'radio',
      label: 'Total AddOn Purchase',
      value: 'TotalAddOnPurchase',
      checked: this.columnFilter=='TotalAddOnPurchase'?true:false
    });
    alert.addInput({
      type: 'radio',
      label: 'AVG Of LTE Usage',
      value: 'AVGLTEUsageMB',
      checked: this.columnFilter=='AVGLTEUsageMB'?true:false
    });
    alert.addInput({
      type: 'radio',
      label: 'AVG Of WiMAX Usage',
      value: 'AvgWiMAXUsageMB',
      checked: this.columnFilter=='AvgWiMAXUsageMB'?true:false
    });
    alert.addInput({
      type: 'radio',
      label: 'No Of LTE SiteAccess',
      value: 'NoOfLTESiteAccess',
      checked: this.columnFilter=='NoOfLTESiteAccess'?true:false
    });
    alert.addInput({
      type: 'radio',
      label: 'No Of WiMAX SiteAccess',
      value: 'NoOfWiMAXSiteAccess',
      checked: this.columnFilter=='NoOfWiMAXSiteAccess'?true:false
    });

    alert.addButton('Cancel');
    alert.addButton({
      text: 'Okay',
      handler: data => {
        console.log('checkbox data:', data);
        this.columnFilter=data;
        console.log('this.filter',this.columnFilter);
        this._gisService.changeMarker(this.schoolGeoList,this.columnFilter);

        if (this.legendElement.nativeElement)
        {
          //console.log('clear');
          //console.log(this.legendElement.nativeElement.firstChild);
          this.legendElement.nativeElement.innerHTML = '';
          this.map.controls[google.maps.ControlPosition.TOP_RIGHT].clear();
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<h6>"+this.columnFilter+"</h6>");
        }
        if (this.columnFilter=='SchoolCoverageStatusASN')
        {
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_01.svg' style='margin-right:5px;'/>Good - Continous Coverage</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_02.svg' style='margin-right:5px;'/>Average - Spotty Coverage</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_03.svg' style='margin-right:5px;'/>Checking WIP</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_04.svg' style='margin-right:5px;'/>Poor - Isolated Coverage</span><br/>");
        }
        else  if (this.columnFilter=='NoOfAltitudeTeachers')
        {
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_01.svg' style='margin-right:5px;'/>150 - 251</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_02.svg' style='margin-right:5px;'/>100 - 150</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_03.svg' style='margin-right:5px;'/>50 - 100</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_04.svg' style='margin-right:5px;'/>0 - 50</span><br/>");
        }
         else  if (this.columnFilter=='NoOfPlanUpgrade')
        {
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_01.svg' style='margin-right:5px;'/>6 - 8</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_02.svg' style='margin-right:5px;'/>4 - 6</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_03.svg' style='margin-right:5px;'/>2 - 4</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_04.svg' style='margin-right:5px;'/>0 - 2</span><br/>");
        }
         else  if (this.columnFilter=='TotalAddOnPurchase')
        {
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_01.svg' style='margin-right:5px;'/>141 - 187</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_02.svg' style='margin-right:5px;'/>94 - 141</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_03.svg' style='margin-right:5px;'/>47 - 94</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_04.svg' style='margin-right:5px;'/>0 - 47</span><br/>");
        }
        else  if (this.columnFilter=='NoofYESAppDownload')
        {
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_01.svg' style='margin-right:5px;'/>75 - 118</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_02.svg' style='margin-right:5px;'/>50 - 75</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_03.svg' style='margin-right:5px;'/>25 - 50</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_04.svg' style='margin-right:5px;'/>0 - 25</span><br/>");
        }
        else if (this.columnFilter=='AVGLTEUsageMB')
        {
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_01.svg' style='margin-right:5px;'/>4101 - 5471</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_02.svg' style='margin-right:5px;'/>2734 - 4101</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_03.svg' style='margin-right:5px;'/>1367 - 2734</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_04.svg' style='margin-right:5px;'/>0 - 1367</span><br/>");

        }
        else if (this.columnFilter=='AvgWiMAXUsageMB')
        {
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_01.svg' style='margin-right:5px;'/>10293 - 13727</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_02.svg' style='margin-right:5px;'/>6862 - 10293</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_03.svg' style='margin-right:5px;'/>3431 - 6862</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_04.svg' style='margin-right:5px;'/>0 - 3431</span><br/>");

        }
        else if (this.columnFilter=='NoOfLTESiteAccess')
        {
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_01.svg' style='margin-right:5px;'/>60 - 80</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_02.svg' style='margin-right:5px;'/>40 - 60</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_03.svg' style='margin-right:5px;'/>20 - 40</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_04.svg' style='margin-right:5px;'/>0 - 20</span><br/>");

        }else
        {
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_01.svg' style='margin-right:5px;'/>42 - 57</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_02.svg' style='margin-right:5px;'/>28 - 42</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_03.svg' style='margin-right:5px;'/>14 - 28</span><br/>");
          this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_04.svg' style='margin-right:5px;'/>0 - 14</span><br/>");

        }
        this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.legendElement.nativeElement);
      }
    });
    alert.present();
  }
  someFunction(event){
    console.log((<HTMLInputElement>event.target).value);
    var arr=(<HTMLInputElement>event.target).value.split(',');
    if (arr.length!=2)
      return;
    var lat=arr[0];
    var lng=arr[1];
    this.searchPoint= this._gisService.highlightMarkerByLatLong(this.searchPoint,lat,lng,null,this.map);
  }
  circleRadiusChange = function (event:any):void {

    console.log(this.circleRadius);
    this._gisService.circleRadius=this.circleRadius;
    
    if (this.filter.state)
      this.changeShowBaseStationCircle();
    if (this.filter.ppd)
    {
      this.changeShowYesCircle();
      this.changeShowSchoolCircle();
    }

  }
  


  //------------------Make layer ON/OFF
  changeShowWimax(){
    if (this.mapFilter.wimax)
    {
        let loader = this.loadingCtrl.create({
            content: "Loading"
        });
            
        loader.present().then(() => {
            this.map.data.setStyle({
              fillColor: '#FFF',
              strokeWeight: 1,
              strokeColor:'#0FAEF2',
              fillOpacity:0.3,
              visible: true
            });
            var self=this;
            this.map.data.loadGeoJson(
              this.serverBaseUrl+"/geoserver/YTLC_Geo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=YTLC_Geo:WM_ActualGoodCoverage_Public&maxFeatures=50&outputFormat=application%2Fjson", 
              null, function(features){
              self.wmFeatures=features;
              loader.dismiss();
              
            });
      });
    }
    else
    {
      if (this.wmFeatures)
        for(var i=0;i<this.wmFeatures.length;++i)
        {
          this.map.data.remove(this.wmFeatures[i]);
        }
    }
  }
  changeShowYesStore(){
   
       let loader = this.loadingCtrl.create({
            content: "Loading"
        });
            
        loader.present().then(() => {
          this.getYesSchoolDataByPPD(this.filter.ppd,loader);
      });
    
  }
  changeShowSchool(){

     let loader = this.loadingCtrl.create({
            content: "Loading"
        });
            
        loader.present().then(() => {
          this.getYesSchoolDataByPPD(this.filter.ppd,loader);           
      });
  }
  changeShowLTE(){
    if (this.mapFilter.lte)
    {
       let loader = this.loadingCtrl.create({
            content: "Loading"
        });
            
        loader.present().then(() => {
            this.map.data.setStyle({
              fillColor: '#FFF',
              strokeWeight: 1,
              strokeColor:'#0FAEF2',
              fillOpacity:0.3,
              visible: true
            });
             var self=this;
            this.map.data.loadGeoJson(
              this.serverBaseUrl+"/geoserver/YTLC_Geo/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=YTLC_Geo:WM_LTE_ActualGoodCoverge_Public&maxFeatures=50&outputFormat=application%2Fjson", 
              null, function(features){
              self.cteFeatures=features;
              loader.dismiss();
            });
      });
    }
    else
    {
      if (this.cteFeatures)
        for(var i=0;i<this.cteFeatures.length;++i)
        {
          this.map.data.remove(this.cteFeatures[i]);
        }
    }
  }
  changeShowBaseStation(){

     let loader = this.loadingCtrl.create({
            content: "Loading"
        });
            
        loader.present().then(() => {
          this.getBaseStationList(loader,true);           
      });

  }
  changeShowYesCircle(){
    this._gisService.deleteMarkers(this.yesCircleList);
    if (this.mapFilter.yesCircle==true){
      var tempArr=[];
      for (var i = 0; i < this.yesGeoList.length ; i++){
        tempArr.push({
          Latitude:this.yesGeoList[i].position.lat(),
          Longitude:this.yesGeoList[i].position.lng()
        });
      }
      this.yesCircleList = this._gisService.addCircleToLatLongArray(tempArr,this.map,'#0FAEF2');
    }
    
  }
  changeShowSchoolCircle(){
    this._gisService.deleteMarkers(this.schoolCicleList);
    if (this.mapFilter.schoolCircle==true){
      var tempArr=[];
      for (var i = 0; i < this.schoolGeoList.length ; i++){
        tempArr.push({
          Latitude:this.schoolGeoList[i].position.lat(),
          Longitude:this.schoolGeoList[i].position.lng()
        });
      }
      this.schoolCicleList = this._gisService.addCircleToLatLongArray(tempArr,this.map,'#007458');
    }
    
  }
  changeShowBaseStationCircle(){

    this._gisService.deleteMarkers(this.baseStationCircleList);
    if (this.mapFilter.baseStationCircle==true){
      var tempArr=[];
      for (var i = 0; i < this.baseStationGeoList.length ; i++){
        tempArr.push({
          Latitude:this.baseStationGeoList[i].position.lat(),
          Longitude:this.baseStationGeoList[i].position.lng()
        });
      }
      this.baseStationCircleList = this._gisService.addCircleToLatLongArray(tempArr,this.map,'#FFC600');
    }

  }
  


//=========================private 
  getBaseStationList(loader,needToDismiss){
    if (this.mapFilter.baseStation!=true || !this.filter.state)
    {
      this._gisService.deleteMarkers(this.baseStationGeoList);
      this._gisService.deleteMarkers(this.baseStationCircleList);
      loader.dismiss();
      return;
    }
    this._service.getBaseStationData(this.filter.state.Id)
              .subscribe(result => 
              {
                this._gisService.deleteMarkers(this.baseStationGeoList);
                this._gisService.deleteMarkers(this.baseStationCircleList);
                
                if(result && result.length>0)
                {
                    this.baseStationList= result;
                     var temp=this._gisService.generatePointLocationOnMap(result,this.map,null,'baseStation',null);
                    this.baseStationGeoList =temp?temp.markersArray:null;
                    this.baseStationCircleList=temp?temp.baseStationCircleArray:null;
                }
              },error => this.errorMessage = <any>error,
              () => {
                if (loader && needToDismiss==true)
                  loader.dismiss();
              });
  }
  getYesSchoolDataByPPD(ppd,loader){
    if (this.mapFilter.yes!=true && this.mapFilter.school!=true)
    {
      this._gisService.deleteMarkers(this.schoolGeoList);
      this._gisService.deleteMarkers(this.yesGeoList);
      this._gisService.deleteMarkers(this.schoolCicleList);
      this._gisService.deleteMarkers(this.yesCircleList);
      loader.dismiss();
      return;
    }

    this._service.getYesSchoolListByPPDName(ppd.PPDName,this.mapFilter.yes,this.mapFilter.school)
                .subscribe(result => 
                {
                  this._gisService.deleteMarkers(this.schoolGeoList);
                  this._gisService.deleteMarkers(this.yesGeoList);
                  this._gisService.deleteMarkers(this.schoolCicleList);
                  this._gisService.deleteMarkers(this.yesCircleList);
                  if(result && result.length>0)
                  {
                      this.schoolList= result;
                      var self=this;
                      var temp=this._gisService.generatePoint(result,this.map,null,this.columnFilter,
                                        this.mapFilter.schoolCircle,this.mapFilter.yesCircle);
                      this.schoolGeoList = temp?temp.schoolArray:null;
                      this.yesGeoList = temp?temp.yesArray:null;
                      this.schoolCicleList = temp?temp.circleArray:null;
                      this.yesCircleList = temp?temp.yesCircleArray:null;
                  }
                },error => this.errorMessage = <any>error,
                () => {
                  loader.dismiss();
                });
  }
  getYesSchoolDataByCityId(cityId,loader){
    if (this.mapFilter.yes!=true && this.mapFilter.school!=true)
    {
      this._gisService.deleteMarkers(this.schoolGeoList);
      this._gisService.deleteMarkers(this.yesGeoList);
      this._gisService.deleteMarkers(this.schoolCicleList);
      this._gisService.deleteMarkers(this.yesCircleList);
      loader.dismiss();
      return;
    }

    this._service.getYesSchoolListByCityId(cityId,this.mapFilter.yes,this.mapFilter.school)
                .subscribe(result => 
                {
                  this._gisService.deleteMarkers(this.schoolGeoList);
                  this._gisService.deleteMarkers(this.yesGeoList);
                  this._gisService.deleteMarkers(this.schoolCicleList);
                  this._gisService.deleteMarkers(this.yesCircleList);
                  if(result && result.length>0)
                  {
                      this.schoolList= result;
                      var self=this;
                      var temp=this._gisService.generatePoint(result,this.map,null,this.columnFilter,
                                        this.mapFilter.schoolCircle,this.mapFilter.yesCircle);
                      this.schoolGeoList = temp?temp.schoolArray:null;
                      this.yesGeoList = temp?temp.yesArray:null;
                      this.schoolCicleList = temp?temp.circleArray:null;
                      this.yesCircleList = temp?temp.yesCircleArray:null;
                  }
                },error => this.errorMessage = <any>error,
                () => {
                  loader.dismiss();
                });
  }
  getYesSchoolListByState(state,loader){
    if (this.mapFilter.yes!=true && this.mapFilter.school!=true)
    {
      this._gisService.deleteMarkers(this.schoolGeoList);
      this._gisService.deleteMarkers(this.yesGeoList);
      loader.dismiss();
      return;
    }

    this._service.getYesSchoolListByState(state,this.mapFilter.yes,this.mapFilter.school)
                .subscribe(result => 
                {
                  this._gisService.deleteMarkers(this.schoolGeoList);
                  this._gisService.deleteMarkers(this.yesGeoList);
                  if(result && result.length>0)
                  {
                      this.schoolList= result;
                      var self=this;
                      var temp=this._gisService.generatePoint(result,this.map,null,this.columnFilter,
                                        this.mapFilter.schoolCircle,this.mapFilter.yesCircle);
                      this.schoolGeoList = temp?temp.schoolArray:null;
                      this.yesGeoList = temp?temp.yesArray:null;
                  }
                },error => this.errorMessage = <any>error,
                () => {
                  loader.dismiss();
                });    
  }
  ZoomToSchoole(schoole,lat,lng){
    this.selectedGeoSchoole= this._gisService.highlightMarkerByLatLong(this.selectedGeoSchoole,lat,lng,schoole,this.map);
    var temp = this.selectedSchoole.NoOfSchools; 
    this.selectedSchoole=schoole;
    this.selectedSchoole.NoOfSchools=temp;
  }
  formatNumber(value){
    if (!value)
      return value;
    
   value = Math.round(value * 100) / 100;
   return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  initiateLegend(){
    this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<p style='font-weight:bold;'>"+this.columnFilter+"</p>");
    this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_01.svg' style='margin-right:5px;'/>Good - Continous Coverage</span><br/>");
    this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_02.svg' style='margin-right:5px;'/>Average - Spotty Coverage</span><br/>");
    this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_03.svg' style='margin-right:5px;'/>Checking WIP</span><br/>");
    this.legendElement.nativeElement.insertAdjacentHTML('beforeend', "<span style='color:black;'><img src='../assets/icon/ico_school_04.svg' style='margin-right:5px;'/>Poor - Isolated Coverage</span><br/>");
    this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(this.legendElement.nativeElement);
    
  }
  toggleWidget(){
    this.firstLoad = false;
    if (this.showingMenu==true)
    {
      this.menuClass="animated bounceOutLeft";
    // setTimeout(()=>{
        this.showingMenu = false;
         this.arrow='arrow-left'
     //}, 1000);
      
      
    }
    else 
    {
      this.menuClass="animated bounceInLeft";
      this.showingMenu = true;
      this.arrow='arrow-right'
      
    }

  }
  clearMap(){
    if (this.selectedGeoSchoole)
    {
      this.selectedGeoSchoole.setMap(null);
      this.selectedSchoole={};
    }
    if (this.searchPoint)
      this.searchPoint.setMap(null);
      
  }
  getAggInfo(aggType,aggValue){
     this._service.getAggInfo(aggType,aggValue)
                .subscribe(result => 
                {
                  if(result && result.length>0)
                  {
                     console.log(result);
                     if (!this.selectedSchoole)
                      this.selectedSchoole={};
                    this.selectedSchoole.NoOfAltitudeTeachers=result[0].NoOfAltitudeTeachers;
                    this.selectedSchoole.NoOfPlanUpgrade=result[0].NoOfPlanUpgrade;
                    this.selectedSchoole.TotalAddOnPurchase=result[0].TotalAddOnPurchase;
                    this.selectedSchoole.NoofYESAppDownload=result[0].NoofYESAppDownload;
                    this.selectedSchoole.NoOfSchools=result[0].NoOfSchools;

                  }
                },error => this.errorMessage = <any>error,
                () => {});
  }
}


