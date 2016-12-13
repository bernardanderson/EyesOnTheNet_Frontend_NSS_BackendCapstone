import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
        name: "cameraSearchPipe"
})

export class CameraSearchPipe implements PipeTransform {  

    transform( cameras: any, cameraTerm: string): any {
        // Is search undefined
        if (cameraTerm === undefined || cameraTerm === "") return cameras;
        // Return updated camera Array
        return cameras.filter( (camera) => camera.name.toLowerCase().includes(cameraTerm.toLowerCase()) 
        )
    }
}

