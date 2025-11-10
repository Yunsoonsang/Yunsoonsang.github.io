// DOM이 완전히 로드된 후 스크립트 실행
document.addEventListener('DOMContentLoaded', function() {
    // 슬라이드 관련 변수 설정
    let totalSlides = 0; // 실제 존재하는 슬라이드 개수 (동적으로 결정)
    let currentSlide = 1; // 현재 슬라이드 인덱스
    const maxSlidesToCheck = 30; // 확인할 최대 슬라이드 번호
    
    // DOM 요소 선택
    const slidesContainer = document.querySelector('.slides');
    const prevButton = document.getElementById('prev-slide');
    const nextButton = document.getElementById('next-slide');
    const slideCounter = document.getElementById('slide-counter');
    const slideViewer = document.querySelector('.slide-viewer');
    
    // 이미지 존재 여부 확인 함수
    function checkImageExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
    
    // 슬라이드 동적 생성
    async function initializeSlides() {
        // 먼저 존재하는 슬라이드 개수 확인
        const existingSlides = [];
        
        for (let i = 1; i <= maxSlidesToCheck; i++) {
            const imageUrl = `images/slides/Slide_${i}.PNG`;
            const exists = await checkImageExists(imageUrl);
            
            if (exists) {
                existingSlides.push(i);
            } else if (existingSlides.length > 0 && i > existingSlides[existingSlides.length - 1] + 2) {
                // 연속으로 2개 이상 없으면 종료 (중간에 빠진 슬라이드 허용)
                break;
            }
        }
        
        totalSlides = existingSlides.length;
        
        if (totalSlides === 0) {
            console.error('슬라이드 이미지를 찾을 수 없습니다.');
            slideCounter.textContent = '슬라이드를 찾을 수 없습니다';
            return;
        }
        
        console.log(`총 ${totalSlides}개의 슬라이드를 찾았습니다.`);
        
        // 슬라이드 생성
        existingSlides.forEach((slideNum, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.setAttribute('role', 'group');
            slide.setAttribute('aria-label', `슬라이드 ${index + 1} / ${totalSlides}`);
            slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
            slide.innerHTML = `<img src="images/slides/Slide_${slideNum}.PNG" alt="슬라이드 ${index + 1}" loading="${index < 3 ? 'eager' : 'lazy'}">`;
            slidesContainer.appendChild(slide);
        });
        
        // 확대 힌트 추가
        const zoomHint = document.createElement('div');
        zoomHint.className = 'zoom-hint';
        zoomHint.textContent = '클릭하여 확대';
        slideViewer.appendChild(zoomHint);
        
        // 초기 슬라이드 위치 설정
        updateSlidePosition();
        
        // 버튼 활성화
        prevButton.disabled = false;
        nextButton.disabled = false;
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
    
    // 전체화면 모달 열기
    function openFullscreenModal() {
        // 모달 컨테이너 생성
        const modal = document.createElement('div');
        modal.className = 'fullscreen-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', '슬라이드 전체화면');
        
        // 슬라이드 뷰어 복제
        const slideViewerClone = slideViewer.cloneNode(true);
        
        // 확대 힌트 제거
        const hintInClone = slideViewerClone.querySelector('.zoom-hint');
        if (hintInClone) {
            hintInClone.remove();
        }
        
        // 슬라이드 컨트롤 복제
        const slideControlsClone = document.querySelector('.slide-controls').cloneNode(true);
        
        // 닫기 버튼 생성
        const closeButton = document.createElement('button');
        closeButton.className = 'close-modal';
        closeButton.innerHTML = '<i class="fas fa-times"></i>';
        closeButton.setAttribute('aria-label', '전체화면 닫기');
        
        // 모달에 요소 추가
        modal.appendChild(closeButton);
        modal.appendChild(slideViewerClone);
        modal.appendChild(slideControlsClone);
        
        document.body.appendChild(modal);
        
        // body 스크롤 방지
        document.body.style.overflow = 'hidden';
        
        // 복제된 슬라이드를 현재 위치로 이동
        const clonedSlidesContainer = slideViewerClone.querySelector('.slides');
        clonedSlidesContainer.style.transform = `translateX(-${(currentSlide - 1) * 100}%)`;
        
        // 복제된 버튼에 이벤트 리스너 추가
        const clonedPrevBtn = slideViewerClone.querySelector('#prev-slide');
        const clonedNextBtn = slideViewerClone.querySelector('#next-slide');
        const clonedCounter = slideControlsClone.querySelector('#slide-counter');
        
        // 모달 내부 슬라이드 업데이트 함수
        function updateModalSlide() {
            clonedSlidesContainer.style.transform = `translateX(-${(currentSlide - 1) * 100}%)`;
            clonedCounter.textContent = `${currentSlide} / ${totalSlides}`;
            // 메인 슬라이드도 동기화
            updateSlidePosition();
        }
        
        clonedPrevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            prevSlide();
            updateModalSlide();
        });
        
        clonedNextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            nextSlide();
            updateModalSlide();
        });
        
        // 닫기 버튼 이벤트
        closeButton.addEventListener('click', closeModal);
        
        // 배경 클릭 시 닫기
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        // ESC 키로 닫기
        function handleEscKey(e) {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowLeft') {
                prevSlide();
                updateModalSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                updateModalSlide();
            }
        }
        
        document.addEventListener('keydown', handleEscKey);
        
        // 모달 닫기 함수
        function closeModal() {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
            document.removeEventListener('keydown', handleEscKey);
        }
    }
    
    // 이벤트 리스너 설정
    prevButton.addEventListener('click', function(e) {
        e.stopPropagation();
        prevSlide();
    });
    
    nextButton.addEventListener('click', function(e) {
        e.stopPropagation();
        nextSlide();
    });
    
    // 슬라이드 뷰어 클릭 시 전체화면 모달 열기
    slideViewer.addEventListener('click', function(e) {
        // 버튼 클릭은 제외
        if (!e.target.closest('.slide-nav-btn')) {
            openFullscreenModal();
        }
    });
    
    // 키보드 탐색
    document.addEventListener('keydown', function(e) {
        // 모달이 열려있지 않을 때만 작동
        if (!document.querySelector('.fullscreen-modal')) {
            switch(e.key) {
                case 'ArrowLeft':
                    prevSlide();
                    break;
                case 'ArrowRight':
                    nextSlide();
                    break;
            }
        }
    });
    
    // 스와이프 제스처 지원 (모바일용)
    let touchStartX = 0;
    let touchEndX = 0;
    
    slideViewer.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    slideViewer.addEventListener('touchend', function(e) {
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
