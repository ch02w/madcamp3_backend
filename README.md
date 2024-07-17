## 개발 스택

- Front-end: React
- Back-end: AWS Lambda (Node.js), API GateWay
- Database: MySQL

## 깃허브

조승완: [ch02w - Overview](https://github.com/ch02w)

김민경: [kim-minkyoung - Overview](https://github.com/kim-minkyoung)


## 개발 기록

![aws](https://github.com/user-attachments/assets/0dd7009e-4a74-4234-ac8a-46f8f91b1754)


AWS Lambda

![github_action](https://github.com/user-attachments/assets/9e85ae05-36c1-4dea-b252-3dfc24605922)


Github Actions

### Serverless Framework

Node.js 서버리스 프레임워크를 통해 백엔드를 구축했다. AWS Lambda 함수를 구성하고, API Gateway (HttpApi)를 사용해 사용할 주소를 매핑해주었다. 서버리스 프레임워크를 통해 AWS 콘솔을 통하지 않고 로컬에서 함수를 작성한 후, deploy 커맨드를 사용하여 배포할 수 있었다. 이에 따라 연결하여 사용할 데이터베이스로 AWS RDS를 선택하였다. 람다와 RDS 사이를 vpc로 연결해서 통신할 수 있었다.

### 자동배포 (CI/CD)

Github Actions를 사용하여 master 브랜치에 push가 되면 자동으로 배포되어 스테이지가 업데이트 (deploy)되도록 구현했다. .github/workflows 폴더 내에 yml 파일을 만들어서 github가 인식하게 했다. 자동 배포를 사용하여 따로 콘솔에 들어가 스테이지를 최신화시키지 않고 로컬에서 관리할 수 있었다.

### WebSocket

처음부터 팀원 둘 다 WebSocket을 써보고 싶단 생각을 하였고, 따라서 유저들이 실시간으로 소통할 수 있는 아이디어를 떠올렸다. 하지만 AWS Lambda를 사용하면서 고정 서버가 존재하지 않아 socket.io를 사용할 수 없어 AWS의 가이드를 따라 진행했다. 화상 채팅을 구현하기 위해 WebRTC를 사용해 서로의 로컬 스트림을 주고받도록 구현했다. WebSocket을 연결한 김에 실시간으로 할 수 있는 여러 기능들도 추가했었고, 결과적으로 WebSocket에 대한 이해도가 크게 증가한 것 같다.

### Technical Issues

- TypeScript를 처음 사용해봤는데 확실히 안정성이 있다는 느낌은 받았지만 타입 체크에 애를 조금 먹었다.
- AWS Lambda, API Gateway (서버리스)에 대한 개념이 부족했던 초반에는 특히 환경 설정이나 배포 등 어려운 부분이 많았던 것 같다.
- 서버 입장에선 user/{userId}와 user/{userid}를 구분할 수 없다. 이 때문에 라우팅이 꼬였기에, 이름을 다시 정리하고 모든 라우팅을 제거한 뒤 재배포하였다.
    - (https://github.com/serverless/serverless/issues/3785)
- 기획이 많은 만큼 로그인을 편하게 하기 위해 카카오 로그인을 구현했었는데, 서브넷 설정 (인터넷 게이트웨이, NAT 게이트웨이 등) 없이 람다 함수에 vpc를 연결하게 되면 외부 리소스에 접근할 수 없다는 점을 몰라 시간 소요를 많이 했었다.
- Lambda를 불러올 때 (5분동안 요청이 없었으면) Cold Start가 되는데 이 과정에서 기능도 느려지고 Timeout Error가 생겼었다.
- 처음에 잘 모르는 상태로 REST API로 진행을 하고 있었는데 CORS 설정이 콘솔 내에서 잘 되지 않아 중간에 HTTP API로 변경하였다.
- Socket을 둘다 처음 써봤기 때문에 초반에 신호를 주고받는 과정부터 어려움을 겪었다.
- WebRTC에 대한 개념이 쉽게 이해가 되지 않아 쌍방 화상 통신이 쉽게 구성이 되지 않았다.
- Offer, Answer, STUN 서버에 연결까지 됐는데도 ICE Candidate이 서로에게 추가되지 않아 애를 먹었는데 offer를 만들기 전에 data channel을 만들어주니 해결되었다.
- 처음에는 온라인 노래방을 기획했었는데, 유튜브 TJ, 금영 영상이 저작권 때문에 다른 웹에서 실행을 하지 못하도록 설정되어 있어서 기획을 변경할 수 밖에 없었다.
- 또한, 유튜브 동시 송출 기능을 구현하려 했는데, 시간이 부족하기도 하고 쌍방 화상 통신보다 더 어려운 듯 해서 이번에는 못 썼지만, 다음엔 유튜브 동시 송출 기능을 꼭 구현해보고 싶다.
- RDS에 연결하여 통신하는 과정에서 API 하나에서 통신을 종료하는 것을 실수로 놓치게 되었는데, 이 함수가 마침 자주 쓰이는 GET 요청의 함수였어서 서버가 수시로 다운되는 문제를 겪었다. 실제로는 커넥션이 너무 많아 RDS가 재부팅되는 과정이었는데, 문제를 파악하는데 꽤 시간이 소요되었다. (CloudWatch에서 로그도 찍히지 않았었기 때문)
- 둘 다 풀스택으로 개발하기로 결정했었는데, 초반에는 서로 코드도 잘 이해하지 못하고 진행 과정이 꼬이는 등의 어려움이 있었지만, 이후에는 오히려 서로 막히는 부분을 해결해줄 수 있어서 이러한 문제들을 잘 극복할 수 있었던 것 같다.

### Database 구성

![db](https://github.com/user-attachments/assets/ca822637-c001-4c9a-a215-6f54414d43ce)


## 기능 설명

### [메인 페이지]



https://github.com/user-attachments/assets/c5ccab43-0e05-4bee-93e2-63efb3f37c64



- 로그인: 카카오톡 로그인



https://github.com/user-attachments/assets/84753d3b-ec25-4c5f-aa9e-11b5b0085325



- 열려 있는 방 조회 가능
- 방 만들기: 열려 있는 방 중 마음에 드는 방이 없으면 직접 방을 만들 수 있음
    - 제목, 방 설명, 모드(랭크/일반), 분야 설정
    

### [방 페이지]



https://github.com/user-attachments/assets/408fe812-c51a-49ba-8624-c5d9bef9df32



- 방장이 방 시작 권한을 갖고 있음
- 사용자들 입장 후 시작
- 채팅 가능(실명제, 방이 시작된 이후에도 당연히 가능!!)



https://github.com/user-attachments/assets/9e76ff14-8f11-4163-8cf0-326af5b984c2




https://github.com/user-attachments/assets/69d7fbfa-1a17-4c11-8e06-94b3d4fd7740




- 현재 장기자랑을 진행하고 있는 사람에겐 on_air 뱃지가 뜬다
- 호응을 하고 싶다면 박수와 미러볼 버튼 누르기(맨 아래 영상 첨부)
- 장기자랑이 끝났을 때(방장과 장기자랑을 한 본인만 장기자랑을 종료할 수 있음)
    - 끝낸 본인(위): 아직 자랑을 시작하지 않은 사람 중 한 명을 지목
    - 나머지 사람들(아래): 장기자랑을 한 사람에게 점수를 매긴다
        - 랭킹 모드: 랭킹에 점수를 반영
        - 일반 모드: 랭킹을 점수에 반영하지 않음(단순 재미용, 점수는 사라진다)
- 점수 산출 기준: 나머지 사람들이 매긴 점수의 평균
- 점수가 산출되면 사용자 이름 아래에 평균 점수가 뜬다

### [마이페이지]



https://github.com/user-attachments/assets/10f908fb-8b6c-4913-a336-519c08569231



- 나의 프로필을 볼 수 있고, 한줄소개를 편집할 수 있음
    - 이름, 팔로잉, 팔로워, 누적 점수, 역대 점수 추이

### [랭킹 보기]



https://github.com/user-attachments/assets/aac40b6e-0e2c-436e-b343-76f772b321c5



https://github.com/user-attachments/assets/f02ec7fa-b7ea-448d-98d6-d98c7d0c4976





- 랭킹 모드에서 얻은 누적 점수를 기준으로 이 서비스를 사용하는 모든 사람들의 점수가 순서대로 나옴
- 팔로워/팔로잉 목록을 볼 수 있음(위)
- 팔로우/언팔로우도 가능(아래)

### [실시간 통신 시연 영상]

[live.mp4.zip](https://github.com/user-attachments/files/16265998/live.mp4.zip)


- 실시간 통신 기능
- Socket을 사용해 한 쪽에서 박수/미러볼 버튼을 누르면 다른 쪽에서도 보이게 된다.
- 자랑 시작/마무리/순서 변경 등 변동사항이 생기면 참여자 전원에게 반영된다.
