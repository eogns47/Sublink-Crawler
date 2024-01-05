function checkUrl(input, url) {
    // URL에서 "www." 다음에 오는 부분 추출
    const NextPart = extractProtocolNextPart(url);

    // 입력된 문자열에 해당 부분이 포함되면 false 반환
    return input.includes(NextPart);
}

function extractProtocolNextPart(url) {
    // 프로토콜 다음에 오는 부분 추출
    const protocols = ['http://', 'https://', 'www.'];
    let nextPart = url;

    for (const protocol of protocols) {
        const protocolIndex = url.indexOf(protocol);
        if (protocolIndex !== -1) {
            nextPart = url.slice(protocolIndex + protocol.length);
        }
    }

    console.log(nextPart);

    return nextPart;
}

// 테스트
const url = 'https://www.example.com';
const input1 = 'example.com';
const input2 = 'www.example.com';
const input3 = 'http://www.example.com';
const input4 = 'www.eefas.com';

const url2 = 'https://172.39.10:3300';
const input5 = '172.39.10:3300/asdasd';
const input6 = '172.319.10:3300/asdasd';

console.log(checkUrl(input1, url)); // true
console.log(checkUrl(input2, url)); // false
console.log(checkUrl(input3, url)); // false
console.log(checkUrl(input4, url)); // false

console.log(checkUrl(input5, url2)); // true
console.log(checkUrl(input6, url2)); // false
