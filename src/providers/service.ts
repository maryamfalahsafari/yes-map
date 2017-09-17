import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Api } from './api';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class Service {

    constructor(public http: Http, public api: Api) { }

 
    getStateList():Observable<any>{
        return this.api.get('yes/GetStateList')
          .map(response =>  response.json());
         // .do(data => console.log('All: ' +  JSON.stringify(data)))
          //.catch(this.handleError);
    }
    getPPDListByStateId(stateId):Observable<any>{
        return this.api.get('yes/GetPPDListByStateId?stateId='+stateId)
          .map(response =>  response.json());
         // .do(data => console.log('All: ' +  JSON.stringify(data)))
          //.catch(this.handleError);
    }
    getCityListByPPDId(ppdId):Observable<any>{
        return this.api.get('yes/GetCityListByPPDId?ppdId='+ppdId)
          .map(response =>  response.json());
          //.do(data => console.log('All: ' +  JSON.stringify(data)));
          //.catch(this.handleError);
    }
    getSchoolListByCityId(cityId):Observable<any>{
        return this.api.get('yes/GetSchoolListByCityId?cityId='+cityId)
          .map(response =>  response.json());
         // .do(data => console.log('All: ' +  JSON.stringify(data)))
          //.catch(this.handleError);
    }
    getYesSchoolListByPPDName(ppdName,yes,school):Observable<any>{
        return this.api.get('yes/GetYesSchoolListByPPDName?ppdName='+ppdName+'&yes='+yes+'&school='+school)
          .map(response =>  response.json());
         // .do(data => console.log('All: ' +  JSON.stringify(data)))
          //.catch(this.handleError);
    }
    getYesData(cityId){
         return this.api.get('yes/GetYesData?cityId='+cityId)
          .map(response =>  response.json());
         // .do(data => console.log('All: ' +  JSON.stringify(data)))
          //.catch(this.handleError);

    }
    getBaseStationData(stateId){
         return this.api.get('yes/GetBaseStationData?stateId='+stateId)
          .map(response =>  response.json());
         // .do(data => console.log('All: ' +  JSON.stringify(data)))
          //.catch(this.handleError);

    }
    getYesSchoolListByCityId(cityId,yes,school):Observable<any>{
        return this.api.get('yes/GetYesSchoolListByCityId?cityId='+cityId+'&yes='+yes+'&school='+school)
          .map(response =>  response.json());
         // .do(data => console.log('All: ' +  JSON.stringify(data)))
          //.catch(this.handleError);
    }
    getYesSchoolListByState(state,yes,school):Observable<any>{
        return this.api.get('yes/GetYesSchoolListByState?state='+state+'&yes='+yes+'&school='+school)
          .map(response =>  response.json());
         // .do(data => console.log('All: ' +  JSON.stringify(data)))
          //.catch(this.handleError);
    }
    getAggInfo(aggType,aggValue):Observable<any>{

          return this.api.get('yes/GetAggInfo?aggType='+aggType+'&aggValue='+aggValue)
          .map(response =>  response.json());
         // .do(data => console.log('All: ' +  JSON.stringify(data)))
          //.catch(this.handleError);

    }
  
   

    private handleError(error: Response) {
        console.error(error);
        return Observable.throw(error.json().error || 'Server error');
    }



 
}