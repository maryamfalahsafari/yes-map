import { Injectable } from '@angular/core';
import { ElementRef } from '@angular/core';

declare var google;


@Injectable()
export class GisService {

    circleRadius:number=3;

    constructor() { }

    loadAndReturnMap(mapElement:ElementRef,mapInfo:any){
        return new google.maps.Map(mapElement.nativeElement, {
                    zoom: mapInfo.zoom,
                    center: new google.maps.LatLng(mapInfo.lat, mapInfo.lng),
                    mapTypeId: google.maps.MapTypeId.ROADMAP ,
    scaleControl: true,
                    streetViewControlOptions: {
                        position: google.maps.ControlPosition.TOP_CENTER
                    },
                    zoomControlOptions: {
                        position: google.maps.ControlPosition.RIGHT_CENTER,
                    },
                    mapTypeControlOptions: {
                        style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                        position: google.maps.ControlPosition.TOP_CENTER
                    },  
                });
        
    }
    generatePoint(mainArr,mapName,callBack,filterColumn,showSchoolCircle,showYesCircle){
        var markersArray=new Array<any>();
        var yesMarkersArray=new Array<any>();
        var circleArray=new Array<any>();
        var yesCircleArray=new Array<any>();
        for (var i = 0; i < mainArr.length ; i++) {
            if (mainArr[i].Kind=='Yes')
                this.createMarker(i,mainArr, mapName,callBack,yesMarkersArray,'yes',filterColumn);
                else this.createMarker(i,mainArr, mapName,callBack,markersArray,'school',filterColumn);
                if (mainArr[i].Kind=='Yes' && showYesCircle==true)
                    yesCircleArray.push( new google.maps.Circle({
                        strokeColor: '#0FAEF2',
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: '#0FAEF2',
                        fillOpacity: 0.1,
                        map: mapName,
                        center: new google.maps.LatLng(mainArr[i].Latitude, mainArr[i].Longitude),
                        radius: this.circleRadius*1000
                    }));
                    else if (showSchoolCircle==true) {
                        circleArray.push( new google.maps.Circle({
                        strokeColor: '#007458',
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: '#007458',
                        fillOpacity: 0.1,
                        map: mapName,
                        center: new google.maps.LatLng(mainArr[i].Latitude, mainArr[i].Longitude),
                        radius: this.circleRadius*1000
                        }));
                    }
        }
        var initialZoom=10;//mapName.getZoom();
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markersArray.length; i++) {
            bounds.extend(markersArray[i].getPosition());
        }
         for (var i = 0; i < yesMarkersArray.length; i++) {
            bounds.extend(yesMarkersArray[i].getPosition());
        }

        mapName.fitBounds(bounds);
        mapName.setZoom(initialZoom);
        return {schoolArray:markersArray,yesArray:yesMarkersArray,circleArray:circleArray,yesCircleArray:yesCircleArray};
    }
    generatePointLocationOnMap(mainArr,mapName,callBack,type,filterColumn){
        
        var markersArray=new Array<any>();
        var baseStationCircleArray=new Array<any>();
        for (var i = 0; i < mainArr.length ; i++) {
                this.createMarker(i,mainArr, mapName,callBack,markersArray,type,filterColumn);
                //  baseStationCircleArray.push( new google.maps.Circle({
                //         strokeColor: '#FFC600',
                //         strokeOpacity: 0.8,
                //         strokeWeight: 1,
                //         fillColor: '#FFC600',
                //         fillOpacity: 0.3,
                //         map: mapName,
                //         center: new google.maps.LatLng(mainArr[i].Latitude, mainArr[i].Longitude),
                //         radius: this.circleRadius*1000
                //     }));
        }
        var initialZoom=type=='baseStation'?6:10;
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < markersArray.length; i++) {
        bounds.extend(markersArray[i].getPosition());
        }

        mapName.fitBounds(bounds);
        mapName.setZoom(initialZoom);
        return {markersArray:markersArray,baseStationCircleArray:baseStationCircleArray};
    }
    createMarker(i,mainArr, mapName,callBack,markersArray,type,filterColumn) {
        
        var infowindow = new google.maps.InfoWindow({});
        
	   	var staffPoint = new google.maps.Marker({
                position:  new google.maps.LatLng(mainArr[i].Latitude, mainArr[i].Longitude),
                icon:  this.GetIcon(type,mainArr[i][filterColumn+'Color']?mainArr[i][filterColumn+'Color']:''),//type=='school'?this.getIconUrl(mainArr[i][filterColumn+'Color']):'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
                customInfo: mainArr[i],
                zIndex : 0});
                var self=this;
        staffPoint.addListener("click",function(event){
            console.log(event.latLng);
            var html='';
            if (type=='school')
            {
                html = "<span style='color:black;'>SchoolCode : <b>" + this.customInfo.SchoolCode+'</b></span><br/>';
                html += "<span style='color:black;'>SchoolServingSite : <b>" + this.customInfo.SchoolServingSite+'</b></span><br/>';
                html += "<span style='color:black;'>NoOfAltitudeTeachers : <b>" + this.customInfo.NoOfAltitudeTeachers+'</b></span><br/>';
                html += "<span style='color:black;'>NoOfPlanUpgrade : <b>" + this.customInfo.NoOfPlanUpgrade+'</b></span><br/>';
                html += "<span style='color:black;'>TotalAddOnPurchase : <b>" + this.customInfo.TotalAddOnPurchase+'</b></span><br/>';
                html += "<span style='color:black;'>SchoolCoverageStatusASN : <b>" + this.customInfo.SchoolCoverageStatusASN+'</b></span><br/>';
                html += "<span style='color:black;'>Location : <b>" + this.customInfo.Latitude+','+this.customInfo.Longitude+'</b></span><br/>';
                
            }else if (type=='yes'){
                html = "<span style='color:black;'>Pincode : <b>" + this.customInfo.Pincode+'</b></span><br/>';
                html += "<span style='color:black;'>StoreName : <b>" + this.customInfo.StoreName+'</b></span><br/>';
                html += "<span style='color:black;'>Telephone : <b>" + this.customInfo.Telephone+'</b></span><br/>';
                html += "<span style='color:black;'>Fax : <b>" + this.customInfo.Fax+'</b></span><br/>';
                html += "<span style='color:black;'>Website : <b>" + this.customInfo.Website+'</b></span><br/>';
                html += "<span style='color:black;'>Location : <b>" + this.customInfo.Latitude+','+this.customInfo.Longitude+'</b></span><br/>';
                

            }else {
                 html = "<span style='color:black;'>Site_ID : <b>" + this.customInfo.Site_ID+'</b></span><br/>';
                html += "<span style='color:black;'>NE_ID : <b>" + this.customInfo.NE_ID+'</b></span><br/>';
                html += "<span style='color:black;'>City : <b>" + this.customInfo.City+'</b></span><br/>';
                html += "<span style='color:black;'>eNB_ID : <b>" + this.customInfo.eNB_ID+'</b></span><br/>';
                html += "<span style='color:black;'>eNB_Name : <b>" + this.customInfo.eNB_Name+'</b></span><br/>';
                html += "<span style='color:black;'>Location : <b>" + this.customInfo.Latitude+','+this.customInfo.Longitude+'</b></span><br/>';

            }
                            infowindow.setContent(html);
                            infowindow.open(mapName, staffPoint);
        });
       
        staffPoint.setMap(mapName);
		markersArray.push(staffPoint);
    }
    GetIcon(type,color){
        
        var result='';
        if (type=='school')
        {
            if (color=='ADFF2F')
             result='assets/icon/ico_school_04.svg';
             else if (color=='00FF00')
             result='assets/icon/ico_school_03.svg';
             else if (color=='32CD32')
             result='assets/icon/ico_school_02.svg';
             else result='assets/icon/ico_school_01.svg';
             
             
        }
            //result='assets/icon/ico_school_03.svg';//'http://www.googlemapsmarkers.com/v1/'+color+'/';
        else if (type=='baseStation')
            result='assets/icon/ico_base_station.svg';//'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            else result='assets/icon/ico_yes_store.svg';//'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
        return result;
    }
    deleteMarkers(markersArray){
        if (markersArray)
        {
            for (var i = 0; i < markersArray.length; i++ ) {
                markersArray[i].setMap(null);
            }
            markersArray.length = 0;
        }
    }
    highlightMarkerByLatLong(previousPoint,lat,lng,info, mapName):any {
		if (previousPoint)
			previousPoint.setMap(null);
        var initialZoom=mapName.getZoom();
	   	var staffPoint = new google.maps.Marker({position:  new google.maps.LatLng(lat, lng),
												 icon:'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
	   											zIndex : 1000});
        if (info){
                        var html = "<span style='color:black;'>SchoolCode : <b>" + info.SchoolCode+'</b></span><br/>';
                        html += "<span style='color:black;'>SchoolServingSite : <b>" + info.SchoolServingSite+'</b></span><br/>';
                        html += "<span style='color:black;'>NoOfAltitudeTeachers : <b>" + info.NoOfAltitudeTeachers+'</b></span><br/>';
                        html += "<span style='color:black;'>NoOfPlanUpgrade : <b>" + info.NoOfPlanUpgrade+'</b></span><br/>';
                        html += "<span style='color:black;'>TotalAddOnPurchase : <b>" + info.TotalAddOnPurchase+'</b></span><br/>';
                        html += "<span style='color:black;'>SchoolCoverageStatusASN : <b>" + info.SchoolCoverageStatusASN+'</b></span><br/>';  
                var infowindow = new google.maps.InfoWindow({});
                infowindow.setContent(html);
                infowindow.open(mapName, staffPoint);  
            }
	   	 var bounds = new google.maps.LatLngBounds();
	   	 bounds.extend(new google.maps.LatLng(lat, lng));
       
         staffPoint.setMap(mapName);
         mapName.setCenter(new google.maps.LatLng(lat, lng));
         mapName.fitBounds(bounds);
         mapName.setZoom(initialZoom);
        return staffPoint;
    }
    changeMarker(geoList,filterColumn)    {
        for(var i=0;i< geoList.length;++i)
        {
          geoList[i].setIcon(this.GetIcon('school',geoList[i].customInfo[filterColumn+'Color']));
        }
    }
    addCircleToLatLongArray(mainArr,mapName,color){
        var circleArray = new Array<any>();
        for (var i = 0; i < mainArr.length ; i++){
            circleArray.push( new google.maps.Circle({
                        strokeColor: color,
                        strokeOpacity: 0.8,
                        strokeWeight: 1,
                        fillColor: color,
                        fillOpacity: 0.1,
                        map: mapName,
                        center: new google.maps.LatLng(mainArr[i].Latitude, mainArr[i].Longitude),
                        radius: this.circleRadius*1000
                    }));
        }
        return circleArray;
    }
}