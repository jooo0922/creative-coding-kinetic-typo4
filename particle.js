'use strict';

const FRICTION = 0.98; // particle들의 이동량을 매 프레임마다 서서히 줄이기 위해 곱해주는 값(마찰력)
const MOVE_SPEED = 0.88; // 제자리에서 벗어난 particle들을 원래 위치로 서서히 돌아오게 만드는 값  

export class Particle {
  constructor(pos, color) {
    this.color = color; // 이전 typo들과는 다르게 color parameter를 추가로 받아옴
    this.maxRadius = Math.random() * (50 - 20) + 20; // 각 particle의 maxRadius값(최대 반지름)은 20 ~ 50 사이의 랜덤값으로 할당하려는 거지?

    this.savedX = pos.x;
    this.savedY = pos.y; // 초기 particle의 x, y값(색상값이 존재하는 픽셀들의 좌표값으로 넣어줌.)
    this.x = pos.x;
    this.y = pos.y; // 이동시킬 particle의 x,y좌표값

    this.progress = 0; // typo3에서 this.cur 처럼 프레임을 카운트해주는 역할인가?
    this.radius = 2; // particle에 할당해 줄 현재 반지름값임과 동시에 각 particle을 둘러싼 현재 최소 유지 거리 영역
    this.vr = 0; // typo4는 particle의 크기도 작아졌다 커졌다 하니까 반지름의 변화량도 있어야 함.
    this.vx = 0;
    this.vy = 0; // 이동시킬 좌표값의 변화량

    this.fps = 30; // 60fps를 30fps로 보이도록 하려는 것
    this.fpsTime = 1000 / this.fps; // 한 프레임에서 다음 프레임까지 걸리는 시간. 대략 33.333...ms
  }

  draw(ctx) {
    /**
     * 매 프레임마다 this.progress를 1씩 증가시키면서
     * this.progress가 100을 넘기 전까지는 계속 if block을 수행시켜줌.
     * 
     * 일단 100번째 프레임까지는 this.vr에 
     * (this.maxRadius - this.radius) / this.fpsTime을 더해서 할당해 줌.
     * 이 공식은 달리 표현하면,
     * (this.maxRadius - this.radius) / (1000 / 30);
     * (this.maxRadius - this.radius) * (30 / 1000);
     * (this.maxRadius - this.radius) * 0.03; 와 같음.
     * 
     * 이런 모양의 공식은 어딘가 익숙하지 않나?
     * (this.savedX - this.x) * MOVE_SPEED; 이거랑 구조가 아주 비슷하다.
     * 이런 모양과 관련된 공식은 두 가지의 알고리즘으로 정리할 수 있음.
     * 
     * 
     * 1. 감속운동 알고리즘
     * 
     * 현재값 += (목표값 - 현재값) * 속도값
     * 
     * 속도값은 0 ~ 1 사이. 감속운동에서는 값이 커질수록 목표값에 빠르게 도달함.
     * 보통 MOVE_SPEED 이런식으로 표기.
     * 얘는 canvas-basic-08/interaction.js 에서도 배우면서 정리해놨던 부분임.
     * 복습을 안해서 까먹고 있었지만 
     * kinetic typo tutorial에서는 빼먹지 않고 계속 사용되는 알고리즘.
     * 감속운동 공식은 정말 자주 사용하기 때문에 그냥 외워서 체화하는 게 좋음.
     * 
     * 
     * 2. 감쇠 진동 알고리즘
     * 
     * 변화량 += (목표값 - 현재값) * 속도값
     * 변화량 *= 마찰력
     * 현재값 += 변화량
     * 
     * 감쇠 진동이란 참고로 현재값이 커졌다 작아졌다를 반복하면서 진동하다가 서서히 목표값에 도달하는 운동
     * 속도값은 0 ~ 1 사이. 감쇠 진동 운동에서는 값이 커질수록 진폭이 짧아지고 진동수가 늘어난다. 즉 빨리 진동한다는 소리
     * 변화량은 말그대로 현재값에 더해줌으로써 현재값을 목표값까지 도달할 수 있도록 변화시키는 값. 
     * 보통 vx, vy, vr 이런식으로 표기.
     * 마찰력은 변화량을 현재값에 더해주기 전 변화량에 곱해주는 값으로써 1보다 작으면서 1에 근접한 값을 주로 사용.
     * 보통 FRICTION 으로 표기
     * 얘는 test-vibration이나 ripple에서 dot에 감쇠진동을 줄 때 사용한 공식과 구조가 거의 유사함.
     * 얘도 감속운동 알고리즘과 마찬가지로 자주 사용되므로 외워서 체화하는 게 좋다.
     *
     * 
     * 이처럼 '(목표값 - 현재값) * 속도값' 모양으로 된 공식이 나타나면
     * 현재값에 더해주는지, 변화량에 먼저 더해주는지에 따라서
     * 감속운동인지, 감쇠 진동인지 판단할 것!
     * 
     * test-slow-and-vibration에 여기서 사용된 공식을 정리해놓음. 참고하면서 공부할 것.
     */
    if (this.progress < 100) {
      // 공식의 구조를 보니 각 particle의 반지름값은 감쇠 진동 운동으로 구현했지?
      // this.fps값이 커질수록 속도값이 커져서, particle이 더 빨리 진동함.
      // 그러나 여기서는 this.fps = 30이므로 속도값이 0.03이 되서 아주 진폭이 길고 느린 진동을 하게 될거임.
      // 즉, 100프레임까지는 particle의 반지름은 this.maxRadius에 도달할 때까지 감쇠 진동을 하게 된다!
      this.vr += (this.maxRadius - this.radius) / this.fpsTime;
      this.vr *= MOVE_SPEED;
    } else {
      // 100프레임을 넘어서는 순간 this.maxRadius까지 도달한 particle의 반지름이 
      // 점점 더 빠른 속도로 줄어듦. this.radius가 음수가 될수도 있음.
      // 이 부분도 test-slow-and-vibration에 추가로 정리해놓음. 참고하면서 공부할 것.
      this.vr -= 2;
    }

    this.progress += 1;

    this.radius += this.vr;
    // 여기까지 particle의 크기 변화를 정리해보자면
    // 100프레임까지는 감쇠 진동을 하면서 particle의 크기가 커졌다 작아졌다 하면서 this.maxRadius에 도달하게 되고,
    // 100프레임 후부터는 this.maxRadius에서부터 점점 더 가파른 속도로 particle의 크기가 작아짐

    // this.x, y를 초기 좌표값(this.savedX,Y)로 돌려놓으려는 것
    // 초기 좌표값으로 돌려놓을때는 감속운동 알고리즘을 이용함
    this.x += (this.savedX - this.x) * MOVE_SPEED;
    this.y += (this.savedY - this.y) * MOVE_SPEED;

    // this.vx, vy에 매 프레임마다 FRICTION(0.98)을 곱해줘서 얘내의 값을 서서히 떨어트리고 나서
    // 아래에서 this.x,y에 더해주기 때문에 
    // particle이 위에 두 줄에 의해 원래 위치로 다시 이동할 때 this.vx, vy의 영향력이 감소될 수 있도록 함.
    // typo2의 particle.js 필기 참고
    this.vx *= FRICTION;
    this.vy *= FRICTION;

    this.x += this.vx;
    this.y += this.vy;
    // 여기까지는 particle의 움직임에 해당함.
    // 그러나 this.vx, vy값이 0에서 바뀌지 않는 이상, this.x,y값의 변화가 없기 때문에
    // 만약 particle에 움직임을 주고자 한다면 다른 모듈에서 this.vx,vy 값에 변화를 줘야 함.

    // 현재 프레임에서 particle의 반지름값(this.radius)가 1보다 커야만 실제 캔버스에 particle을 그려줌
    // 위에 else block에서 this.vr -= 2; 해줌으로 인해 this.radius가 음수가 되어버리는 상황을 방지하기 위함.
    // arc의 반지름값에 음수를 넣어버리면 오류가 날테니까!
    // 따라서 this.radius가 계속 작아지다가 음수가 되버린 애들은 캔버스에 아예 그려지지 않을테니 없어지게 됨.
    if (this.radius > 1) {
      /**
       * CanvasRenderingContext2D.createRadialGradient() 
       * 이 메서드는 두 원의 크기와 좌표를 사용하여 반지름 상에 그라데이션을 만듦.
       * 캔버스에 그려진 도형들에 적용하려면 이 메소드에서 리턴받은 canvas gradation을
       * fillStyle이나 strokeStyle에 할당해줘야 함.
       * 
       * 이렇게 하면 단순히 반지름 상에 그라데이션이 적용될 준비만 되는 것.
       * addColorStop으로 
       * '이 지점의 이 색상값에서 저 지점의 저 색상값으로' 
       * 그라데이션을 줄 것인지 정해줘야 함.
       * 
       * 이것도 ccreative-coding-gradation에서 다뤄봤음. 복습할 때 참고할 것.
       */
      const g = ctx.createRadialGradient(
        this.x, this.y, this.radius / 2,
        this.x, this.y, this.radius
      );

      /**
       * CanvasGradient.addColorStop()
       * 포토샵에서 그라데이션 줄 때 그라데이션 색상표 위에다가 점찍는 거 있지? 
       * 그 점이 colorStop에 해당함.
       * 
       * canvas gradation 상에 그 점들을 찍어주는 거라고 보면 됨.
       * 
       * 이것도 ccreative-coding-gradation에서 다뤄봤음. 복습할 때 참고할 것.
       */
      g.addColorStop(0, this.color);
      g.addColorStop(1, `rgba(0, 0, 0, 0)`);

      ctx.beginPath();
      ctx.fillStyle = g; // createRadialGradient()에서 리턴받은 canvas gradient를 fillStyle에 할당해줘야 그라데이션이 적용됨.
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}