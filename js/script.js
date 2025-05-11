// DOM이 완전히 로드된 후 스크립트 실행
document.addEventListener('DOMContentLoaded', function() {
    // 슬라이드 관련 변수 설정
    const totalSlides = 21; // 슬라이드 총 개수
    let currentSlide = 1; // 현재 슬라이드 인덱스
    
    // DOM 요소 선택
    const slidesContainer = document.querySelector('.slides');
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    const slideCounter = document.getElementById('slide-counter');
    
    // 슬라이드 동적 생성
    function initializeSlides() {
        // 슬라이드 생성
        for (let i = 1; i <= totalSlides; i++) {
            const slide = document.createElement('div');
            slide.className = 'slide';
            // Slide_1.PNG 형식 파일명 사용
            slide.innerHTML = `<img src="images/slides/Slide_${i}.PNG" alt="슬라이드 ${i}" loading="${i <= 3 ? 'eager' : 'lazy'}">`;
            slidesContainer.appendChild(slide);
        }
        
        // 초기 슬라이드 위치 설정
        updateSlidePosition();
    }
    
    // 슬라이드 위치 업데이트
    function updateSlidePosition() {
        slidesContainer.style.transform = `translateX(-${(currentSlide - 1) * 100}%)`;
        slideCounter.textContent = `${currentSlide} / ${totalSlides}`;
    }
    
    // 다음 슬라이드로 이동
    function nextSlide() {
        if (currentSlide >= totalSlides) {
            currentSlide = 1; // 마지막 슬라이드에서 첫 번째로 이동
        } else {
            currentSlide++;
        }
        updateSlidePosition();
    }
    
    // 이전 슬라이드로 이동
    function prevSlide() {
        if (currentSlide <= 1) {
            currentSlide = totalSlides; // 첫 번째 슬라이드에서 마지막으로 이동
        } else {
            currentSlide--;
        }
        updateSlidePosition();
    }
    
    // 이벤트 리스너 설정
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);
    
    // 키보드 탐색
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft') {
            prevSlide();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
        }
    });
    
    // 스와이프 제스처 지원 (모바일용)
    let touchStartX = 0;
    let touchEndX = 0;
    
    slidesContainer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slidesContainer.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50; // 스와이프 감지 임계값
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // 왼쪽으로 스와이프: 다음 슬라이드
            nextSlide();
        }
        
        if (touchEndX > touchStartX + swipeThreshold) {
            // 오른쪽으로 스와이프: 이전 슬라이드
            prevSlide();
        }
    }
    
    // 페이지 로드 시 슬라이드 초기화
    initializeSlides();
});