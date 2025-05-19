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
    const thumbnailGallery = document.querySelector('.thumbnail-gallery');
    
    // 슬라이드 및 썸네일 동적 생성
    function initializeSlides() {
        // 슬라이드 생성
        for (let i = 1; i <= totalSlides; i++) {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-label', `슬라이드 ${i} / ${totalSlides}`);
            slide.setAttribute('aria-hidden', i === 1 ? 'false' : 'true');
            // Slide_1.PNG 형식의 이미지 파일 사용
            slide.innerHTML = `<img src="images/slides/Slide_${i}.PNG" alt="슬라이드 ${i}" loading="${i <= 3 ? 'eager' : 'lazy'}">`;
            slidesContainer.appendChild(slide);
            
            // 썸네일 생성
            const thumbnail = document.createElement('div');
            thumbnail.className = i === 1 ? 'thumbnail active' : 'thumbnail';
            thumbnail.innerHTML = `<img src="images/slides/Slide_${i}.PNG" alt="썸네일 ${i}">`;
            thumbnail.dataset.slide = i;
            thumbnailGallery.appendChild(thumbnail);
            
            // 썸네일 클릭 이벤트
            thumbnail.addEventListener('click', function() {
                goToSlide(parseInt(this.dataset.slide));
            });
        }
        
        // 초기 슬라이드 위치 설정
        updateSlidePosition();
    }
    
    // 슬라이드 위치 업데이트
    function updateSlidePosition() {
        slidesContainer.style.transform = `translateX(-${(currentSlide - 1) * 100}%)`;
        slideCounter.textContent = `${currentSlide} / ${totalSlides}`;
        
        // 슬라이드 접근성 상태 업데이트
        document.querySelectorAll('.slide').forEach((slide, index) => {
            if (index + 1 === currentSlide) {
                slide.setAttribute('aria-hidden', 'false');
            } else {
                slide.setAttribute('aria-hidden', 'true');
            }
        });
        
        // 썸네일 활성화 상태 업데이트
        document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
            if (index + 1 === currentSlide) {
                thumb.classList.add('active');
                // 활성화된 썸네일에 애니메이션 적용
                thumb.classList.add('fade-in');
                // 애니메이션이 끝나면 클래스 제거
                setTimeout(() => {
                    thumb.classList.remove('fade-in');
                }, 500);
            } else {
                thumb.classList.remove('active');
            }
        });
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
    
    // 특정 슬라이드로 이동
    function goToSlide(slideNumber) {
        currentSlide = slideNumber;
        updateSlidePosition();
    }
    
    // 프레젠테이션 모드 시작
    function startPresentationMode() {
        // 프레젠테이션 모드 컨테이너 생성
        const presentationContainer = document.createElement('div');
        presentationContainer.className = 'presentation-mode';
        
        // 슬라이드 뷰어 복제
        const slideViewerClone = document.querySelector('.slide-viewer').cloneNode(true);
        const slideControlsClone = document.querySelector('.slide-controls').cloneNode(true);
        
        // 프레젠테이션 모드에 요소 추가
        presentationContainer.appendChild(slideViewerClone);
        presentationContainer.appendChild(slideControlsClone);
        
        // 닫기 버튼 추가
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.style.position = 'absolute';
        closeButton.style.top = '20px';
        closeButton.style.right = '20px';
        closeButton.style.color = 'white';
        closeButton.style.fontSize = '2rem';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.cursor = 'pointer';
        
        closeButton.addEventListener('click', function() {
            document.body.removeChild(presentationContainer);
        });
        
        presentationContainer.appendChild(closeButton);
        document.body.appendChild(presentationContainer);
        
        // ESC 키로 프레젠테이션 모드 종료
        document.addEventListener('keydown', function escKeyHandler(e) {
            if (e.key === 'Escape') {
                document.body.removeChild(presentationContainer);
                document.removeEventListener('keydown', escKeyHandler);
            }
        });
    }
    
    // 이벤트 리스너 설정
    prevButton.addEventListener('click', prevSlide);
    nextButton.addEventListener('click', nextSlide);
    
    // 키보드 탐색
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'ArrowLeft':
                prevSlide();
                break;
            case 'ArrowRight':
                nextSlide();
                break;
            case 'f':
                startPresentationMode();
                break;
        }
    });
    
    // 더블클릭으로 프레젠테이션 모드 시작
    slidesContainer.addEventListener('dblclick', startPresentationMode);
    
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
    
    // 이미지 지연 로딩 설정
    const lazyLoadImages = function() {
        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver(function(entries, observer) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        const image = entry.target;
                        image.src = image.src; // 이미지 로드 트리거
                        imageObserver.unobserve(image);
                    }
                });
            });
            
            lazyImages.forEach(function(image) {
                imageObserver.observe(image);
            });
        }
    };
    
    // 페이지 로드 시 초기화
    initializeSlides();
    lazyLoadImages();
});