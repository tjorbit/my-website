
let histogramChart = null;
let polygonChart = null;


// ==============================
// 1. 통계 계산
// ==============================

function calculate() {

    const input = document.getElementById("dataInput").value;

    const numbers = input
        .split(/[\s,]+/)
        .filter(value => value !== "")
        .map(Number);

    // 입력 검사
    if (
        numbers.length === 0 ||
        numbers.some(number => !Number.isFinite(number))
    ) {
        alert("올바른 숫자를 입력해주세요!");
        return;
    }

    // 정렬
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = numbers.length;

    // 평균
    const sum = numbers.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    // 중앙값
    const median = getMedian(sorted);

    // 최빈값
    const frequency = {};

    numbers.forEach(number => {
        frequency[number] = (frequency[number] || 0) + 1;
    });

    const maxFrequency = Math.max(...Object.values(frequency));

    const modes = Object.keys(frequency)
        .filter(number => frequency[number] === maxFrequency)
        .map(Number);

    const modeResult =
        maxFrequency === 1 ? "없음" : modes.join(", ");

    // 분산과 표준편차
    const squaredDifferences = numbers.map(
        number => Math.pow(number - mean, 2)
    );

    const populationVariance =
        squaredDifferences.reduce((a, b) => a + b, 0) / n;

    const populationStd = Math.sqrt(populationVariance);

    // 화면에 표시
    document.getElementById("mean").textContent = mean.toFixed(4);
    document.getElementById("median").textContent = median.toFixed(4);
    document.getElementById("mode").textContent = modeResult;
    document.getElementById("std").textContent = populationStd.toFixed(4);

    // 그래프 업데이트
    updateCharts(numbers);
}


// ==============================
// 2. 중앙값 계산
// ==============================

function getMedian(data) {

    const n = data.length;
    const mid = Math.floor(n / 2);

    if (n % 2 === 0) {
        return (data[mid - 1] + data[mid]) / 2;
    }

    return data[mid];
}


// ==============================
// 3. 그래프 전체 업데이트
// ==============================

function updateCharts(numbers) {

    drawHistogram(numbers);
    drawPolygon(numbers);
    drawBoxplot(numbers);
}


// ==============================
// 4. 계급과 도수 계산
// ==============================

function getFrequencyData(numbers) {

    const min = Math.min(...numbers);
    const max = Math.max(...numbers);

    const binCount = Math.max(
        1,
        Math.ceil(Math.log2(numbers.length) + 1)
    );

    const width = max === min ? 1 : (max - min) / binCount;

    const bins = Array(binCount).fill(0);
    const labels = [];
    const centers = [];

    numbers.forEach(number => {

        let index = Math.floor((number - min) / width);

        if (index >= binCount) {
            index = binCount - 1;
        }

        bins[index]++;
    });

    for (let i = 0; i < binCount; i++) {

        const start = min + i * width;
        const end = min + (i + 1) * width;
        const center = (start + end) / 2;

        labels.push(
            `${start.toFixed(2)} ~ ${end.toFixed(2)}`
        );

        centers.push(center.toFixed(2));
    }

    return {
        bins,
        labels,
        centers
    };
}


// ==============================
// 5. 도수분포 그래프
// ==============================

function drawHistogram(numbers) {

    const result = getFrequencyData(numbers);

    const ctx = document
        .getElementById("histogramChart")
        .getContext("2d");

    if (histogramChart) {
        histogramChart.destroy();
    }

    histogramChart = new Chart(ctx, {

        type: "bar",

        data: {
            labels: result.labels,

            datasets: [{
                label: "도수",
                data: result.bins,
                backgroundColor: "#60a5fa",
                borderColor: "#2563eb",
                borderWidth: 1,
                borderRadius: 5
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: true,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        precision: 0
                    },

                    title: {
                        display: true,
                        text: "도수"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "계급"
                    }
                }
            }
        }
    });
}


// ==============================
// 6. 도수분포다각형
// ==============================

function drawPolygon(numbers) {

    const result = getFrequencyData(numbers);

    const ctx = document
        .getElementById("polygonChart")
        .getContext("2d");

    if (polygonChart) {
        polygonChart.destroy();
    }

    polygonChart = new Chart(ctx, {

        type: "line",

        data: {
            labels: result.centers,

            datasets: [{
                label: "도수",
                data: result.bins,
                borderColor: "#2563eb",
                backgroundColor: "rgba(37, 99, 235, 0.12)",
                borderWidth: 3,
                pointRadius: 5,
                pointBackgroundColor: "#2563eb",
                fill: true,
                tension: 0
            }]
        },

        options: {
            responsive: true,

            scales: {
                y: {
                    beginAtZero: true,

                    ticks: {
                        precision: 0
                    },

                    title: {
                        display: true,
                        text: "도수"
                    }
                },

                x: {
                    title: {
                        display: true,
                        text: "계급값"
                    }
                }
            }
        }
    });
}


// ==============================
// 7. 상자수염그림
// ==============================

function drawBoxplot(numbers) {

    const sorted = [...numbers].sort((a, b) => a - b);

    const n = sorted.length;

    const median = getMedian(sorted);

    const lowerHalf = sorted.slice(0, Math.floor(n / 2));
    const upperHalf = sorted.slice(Math.ceil(n / 2));

    const q1 = lowerHalf.length
        ? getMedian(lowerHalf)
        : sorted[0];

    const q3 = upperHalf.length
        ? getMedian(upperHalf)
        : sorted[n - 1];

    const min = sorted[0];
    const max = sorted[n - 1];

    const canvas = document.getElementById("boxplotChart");
    const ctx = canvas.getContext("2d");

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth;
    const h = 260;

    canvas.width = w * dpr;
    canvas.height = h * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const padding = 45;
    const plotWidth = w - padding * 2;

    let dataMin = min;
    let dataMax = max;

    if (dataMin === dataMax) {
        dataMin -= 1;
        dataMax += 1;
    }

    const range = dataMax - dataMin;

    function x(value) {
        return padding +
            ((value - dataMin) / range) * plotWidth;
    }

    const centerY = 120;
    const boxHeight = 65;

    // 격자
    ctx.strokeStyle = "#e2e8f0";
    ctx.fillStyle = "#64748b";
    ctx.font = "11px Arial";
    ctx.textAlign = "center";

    for (let i = 0; i <= 4; i++) {

        const value = dataMin + range * i / 4;
        const px = x(value);

        ctx.beginPath();
        ctx.moveTo(px, 40);
        ctx.lineTo(px, 195);
        ctx.stroke();

        ctx.fillText(value.toFixed(2), px, 220);
    }

    // 수염
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.moveTo(x(min), centerY);
    ctx.lineTo(x(q1), centerY);

    ctx.moveTo(x(q3), centerY);
    ctx.lineTo(x(max), centerY);
    ctx.stroke();

    // 수염 끝
    [min, max].forEach(value => {

        ctx.beginPath();
        ctx.moveTo(x(value), centerY - 13);
        ctx.lineTo(x(value), centerY + 13);
        ctx.stroke();
    });

    // 상자
    ctx.fillStyle = "rgba(96, 165, 250, 0.3)";
    ctx.strokeStyle = "#2563eb";

    ctx.fillRect(
        x(q1),
        centerY - boxHeight / 2,
        x(q3) - x(q1),
        boxHeight
    );

    ctx.strokeRect(
        x(q1),
        centerY - boxHeight / 2,
        x(q3) - x(q1),
        boxHeight
    );

    // 중앙값
    ctx.strokeStyle = "#dc2626";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(x(median), centerY - boxHeight / 2);
    ctx.lineTo(x(median), centerY + boxHeight / 2);
    ctx.stroke();

    // 설명
    ctx.fillStyle = "#334155";
    ctx.font = "12px Arial";
    ctx.textAlign = "center";

    ctx.fillText("최솟값", x(min), 25);
    ctx.fillText("Q1", x(q1), 25);
    ctx.fillText("중앙값", x(median), 25);
    ctx.fillText("Q3", x(q3), 25);
    ctx.fillText("최댓값", x(max), 25);
}
