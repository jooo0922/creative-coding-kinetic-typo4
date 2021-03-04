'use strict';

// 이전에 했던 것들처럼 visual.js에서 Text, Particle 인스턴스를 생성해줄거임.
import {
  Text
} from './text.js';

import {
  Particle
} from './particle.js';

import {
  hslToHex
} from './utils.js';

export class Visual {
  constructor() {
    this.text = new Text(); // Text 인스턴스를 생성해 임시 캔버스를 만듦

    this.particles = []; // 색상값이 존재하는 픽셀의 좌표값들로 만든 Particle 인스턴스들을 담아놓을 빈 배열

    // 마우스가 움직인 좌표값과 마우스 주변을 둘러싼 반경(영역)의 반지름값을 저장함
    this.mouse = {
      x: 0,
      y: 0,
      radius: 100
    }

    document.addEventListener('pointermove', this.onMove.bind(this), false);
  }

  // 리사이징 이벤트가 발생할 때마다 리사이즈된 브라우저 사이즈를 가져온 뒤
  // 해당 사이즈에 맞게 텍스트 위치를 조정하여 임시 캔버스에 렌더해주고,
  // 임시캔버스에 색상값이 존재하는 픽셀들의 좌표값 배열을 구하여 return해줌.
  show(stageWidth, stageHeight) {
    // 이 때, density가 20이니까 particle들이 렌더될 좌표값 배열(색상값이 존재하는 픽셀들의 좌표값)이
    // 띄엄띄엄 할당받아서 return해줄거임. 
    // 왜냐하면, 여기서는 particle들이 커졌다 작아졌다 하기 때문에 색상값이 존재하는 모든 픽셀에 
    // particle들을 뺵뺵하게 생성해주기 보다는 각자 공간을 가지고 널널하게 생성해주는게 particle의 크기 변화를 보기 편하겠지
    this.pos = this.text.setText('W', 20, stageWidth, stageHeight);
    this.posTotal = this.pos.length - 1; // 색상값이 존재하는 픽셀들의 좌표값 배열의 마지막 인덱스값 같은데?
  }

  animate(ctx) {
    // 만약 색상값이 존재하는 픽셀 좌표값 배열을 할당받지 못해서 this.pos가 undefined라면 
    // animate함수 실행을 중단하고 빠져나오도록 함. 
    // 근데 코드 구조상 브라우저가 로드되면 this.pos에 배열이 할당될 수밖에 없기 때문에 
    // 이걸 작성안해줘도 지장은 없을 듯. 
    if (!this.pos) {
      return;
    }

    // this.pos의 좌표값들 중 10개만 랜덤으로 뽑아서 10개의 Particle 인스턴스만 랜덤하게 생성해줌. 근데 10개 가지고 되나?
    // typo1,2,3과의 차이점이라면, 얘내들은 Particle인스턴스를 리사이징 이벤트가 발생할 때만 show()에서 생성해줬다면,
    // typo3에서는 animate()에서 생성하기 때문에 매 프레임마다 10개의 Particle 인스턴스가 랜덤 생성됨.
    // 그럼 또 원래 생성된 애들까지 누적되면서 너무 많아지지 않을까? 싶지만
    // particle.js의 draw메소드에서 한 번 생성된 particle은 100프레임이 지나는 순간
    // 반지름이 계속 작아지다가 1보다 작아지면 아예 화면에서 안그려줘서 사라지도록 함.
    // 개다가 두 번째 for loop에서도 반지름값이 1보다 작은 Particle은 아예 this.particles에서 제거해버림.
    // typo4는 전반적으로 이런 식으로 particle이 매 프레임마다 10개씩 랜덤하게 새로 생성됬다가
    // 일정 시간이 지나면 크기가 점점 작아지면서 사라지도록 해줌. 
    for (let i = 0; i < 10; i++) {
      /**
       * 자바스크립트 비트 연산자를 이용한 소수점 제거
       * 
       * this.pos[index]에 들어갈 index값을 계산할 때 비트 OR 연산이 사용됨.
       * 여기서 (Math.random() * this.posTotal)는 0 ~ this.posTotal 사이의 임의의 숫자를 return해줌.
       * 이 때의 랜덤값은 소수점을 포함한 랜덤값이므로, 배열의 index로는 사용할 수 없는 값임.
       * 
       * Math.floor(), Math.ceil(), Math.round() 등을 이용해서 소수점 이하를 버림할 수 있지만,
       * (Math.random() * this.posTotal) | 0 와 같이
       * 랜덤값을 0과 비트 OR 연산하면 소수점이 제거된 정수값을 리턴받을 수 있음.
       * 
       * 비트연산을 통한 소수점 제거가 위의 메소드들을 사용한 것보다 속도가 약간 빠르다고 함.
       * 북마크 자료 및 test-bit-OR-calculation 참고
       */
      // 결과적으로 myPos에는 0 ~ this.posTotal 사이의 정수값을 index로 하여 this.pos의 해당번째 좌표값에 접근함.
      const myPos = this.pos[(Math.random() * this.posTotal) | 0];

      // myPos에 할당된 좌표값과 this.getColor()에서 리턴받은 색상값으로 
      // Particle 인스턴스를 생성해 this.particle에 push해줌.
      this.particles.push(new Particle(myPos, this.getColor()));
    }

    // 랜덤으로 생성된 10개의 Particle 인스턴스들 각각에 for loop를 돌리면서
    // 마우스가 최소 유지 거리를 침범했는지 여부에 따라 각 인스턴스의 this.progress값에 변화를 줘서
    // 각 particle들의 크기(반지름)에도 변화를 줌
    for (let i = 0; i < this.particles.length; i++) {
      // 랜덤으로 생성된 10개의 Particle 인스턴스들 중에서 만약 반지름값이 1보다 작은 애가 있다면
      // this.particles 배열에서 해당 인스턴스를 splice로 삭제해버림.
      const item = this.particles[i];
      if (item.radius <= 1) {
        this.particles.splice(i, 1);
      }

      // 현재 각 particle들 지점과 현재 마우스가 움직인 지점 사이의 실제 거리를 구해줌.
      const dx = this.mouse.x - item.x;
      const dy = this.mouse.y - item.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // 최소 유지 거리를 구해줌.
      // 다만 typo4에서는 this.radius값이 항상 변한다는 점!
      // particle 크기가 클수록 최소 유지 거리도 커지게 됨
      const minDist = item.radius + this.mouse.radius;

      // 현재 실제 거리가 최소 유지 거리보다 작다면, 즉 마우스가 해당 particle의 영역을 침범했다면
      // 침범당한 particle의 this.progress를 100만큼 한방에 늘려줌 -> 침범당한 particle의 반지름이 급격히 줄어듦.
      // 계속 작아지다가 0보다 작아지면 사라지게 됨. 
      // 왜냐? particle.js의 draw메소드에서 0보다 작으면 캔버스에 안그려주도록 했으니까. 
      if (dist < minDist) {
        item.progress += 100;
      }

      // typo1,2,3과 달리 최소유지 거리를 침범당하면 해당 particle의 this.vx,vy값에 변화를 주지 않고
      // this.progress값만 바꿔서 particle의 크기를 줄이기만 함.
      // 따라서 마우스 움직임에 의해 particle의 위치는 변하지 않고 크기만 변하게 될거임.
      // 이러한 particle의 움직임을 이제 draw메소드에서 그려주게 될거임.
      item.draw(ctx);
    }
  }

  getColor() {
    // particle이 어떻게 생성되고 움직이는지 보여주려고 임시로 지정해준 컬러. 나중에 지워줄거임.
    // return '#ff0000';

    // 채도와 명도는 각각 84%(채도가 짙은 편), 50%(원래 색상)로 고정된 값을 parameter로 전달해주고
    // Hue(색상)값은 80도 ~ 340도 사이의 값으로 전달해주려는 것.
    // 색상 휠을 참고해보면 저 범위에서 제외된 340~360도, 0~80도 사이의 색상들이 제외될 것임을 알 수 있음.
    const minHue = 80;
    const maxHue = 340;
    const hue = (maxHue - minHue) * Math.random() + minHue;
    return hslToHex(hue, 84, 50);
  }

  // 마우스가 움직일 때마다 좌표값을 this.mouse.x,y에 각각 override해줌.
  onMove(e) {
    this.mouse.x = e.clientX;
    this.mouse.y = e.clientY;
  }
}