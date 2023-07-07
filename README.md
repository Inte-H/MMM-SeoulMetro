# MMM-SeoulMetro 모듈

`MMM-SeoulMetro` 모듈은 서울시 지하철의 실시간 도착 정보를 표시하는 MagicMirror 모듈입니다. 이 모듈은 서울특별시에서 제공하는 서울시 열린데이터 광장의 API를 사용하여 데이터를 가져옵니다.

## 설치

1. 명령 프롬프트에서 MagicMirror의 `modules` 디렉토리로 이동합니다.
2. 다음 명령을 실행하여 이 리포지토리를 복제합니다: `git clone https://github.com/example/MMM-SeoulMetro.git`
3. 종속성을 설치하기 위해 다음 명령을 실행합니다: `npm install`

## 설정

이 모듈을 사용하려면 MagicMirror 설치의 `config/config.js` 파일의 modules 배열에 추가하세요.

```javascript
{
	module: 'MMM-SeoulMetro',
	position: 'bottom_left',
	config: {
		statnNm: "죽전", // 표시하고 싶은 역명을 선택해주세요
		apiKey: "sample" // API 키를 발급해주세요
	}
},
```

[서울시 지하철 실시간 도착정보> 데이터셋> 공공데이터 | 서울열린데이터광장](http://data.seoul.go.kr/dataList/OA-12764/A/1/datasetView.do;jsessionid=E12A991C22BD40C06C953E0B153FB238.new_portal-svr-21)에서 API 키를 발급받고 링크의 파일을 참조해 표시할 역명을 정해주세요.

config에서 추가적으로 다음의 옵션을 수정할 수 있습니다.
|옵션|기본값|설명|
|---|---|---|
|`Interval`|`1000 * 60`|정보 갱신 주기입니다.(기본값은 1분)|
