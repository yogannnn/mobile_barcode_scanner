(function() {
    var lastFocusedField = null;
    var pendingScanResult = null;

    // ---------- Focus tracking ----------
    function initFocusTracker() {
        document.addEventListener('focusin', function(event) {
            var target = event.target;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
                lastFocusedField = target;
            }
        });
    }

    function attachButton() {
        if (document.querySelector('.o_barcode_scanner_button')) return;
        var button = document.createElement('div');
        button.className = 'o_barcode_scanner_button';
        button.innerHTML = '📷';
        button.title = 'Scan barcode';
        button.onclick = function() {
            if (lastFocusedField) {
                startScan();
            } else {
                alert("Please click inside a text field first (barcode field, product name, etc.)");
            }
        };
        document.body.appendChild(button);
        initFocusTracker();
    }

    // ---------- Value insertion ----------
    function insertValue(text) {
        if (lastFocusedField && document.body.contains(lastFocusedField)) {
            lastFocusedField.value = text;
            lastFocusedField.dispatchEvent(new Event('input', { bubbles: true }));
            lastFocusedField.dispatchEvent(new Event('change', { bubbles: true }));
            lastFocusedField.focus();
        } else {
            pendingScanResult = text;
            alert("Scanned: " + text + "\nNow click into any text field to paste the value.");
            var clickHandler = function(e) {
                var target = e.target;
                if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
                    target.value = pendingScanResult;
                    target.dispatchEvent(new Event('input', { bubbles: true }));
                    target.dispatchEvent(new Event('change', { bubbles: true }));
                    target.focus();
                    pendingScanResult = null;
                    document.removeEventListener('click', clickHandler);
                }
            };
            document.addEventListener('click', clickHandler);
        }
    }

    // ---------- Camera constraints (focus + zoom) ----------
    function applyCameraConstraints(scanner) {
        try {
            scanner.applyVideoConstraints({
                focusMode: "continuous",
                advanced: [{ zoom: 2.0 }]
            }).catch(function(err) {
                console.warn('[BarcodeScanner] Constraints not applied:', err);
            });
        } catch (e) {
            console.warn('[BarcodeScanner] applyVideoConstraints not available:', e);
        }
    }

    // ---------- Main scan flow ----------
    function startScan() {
        if (typeof Html5Qrcode === 'undefined') {
            alert("Scanner library not loaded. Please refresh the page.");
            return;
        }

        var overlay = document.createElement('div');
        overlay.className = 'o_barcode_overlay';
        overlay.innerHTML =
            '<div id="qr-reader" style="width: 90%; max-width: 500px;"></div>' +
            '<div class="o_barcode_hint">Tap on the video to refocus</div>' +
            '<button id="close-scanner">Close</button>';
        document.body.appendChild(overlay);

        var scanner = new Html5Qrcode("qr-reader");

        // Адаптивный qrbox: 70% от меньшей стороны вьюпорта
        var config = {
            fps: 10,
            qrbox: function(vw, vh) {
                var m = Math.floor(Math.min(vw, vh) * 0.7);
                return { width: m, height: m };
            },
            aspectRatio: 1.0,
            disableFlip: false,
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            }
        };

        var stopped = false;
        function safeStop(then) {
            if (stopped) { if (then) then(); return; }
            stopped = true;
            scanner.stop().then(function() {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (then) then();
            }).catch(function() {
                if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
                if (then) then();
            });
        }

        scanner.start(
            { facingMode: "environment" },
            config,
            function(decodedText) {
                safeStop(function() { insertValue(decodedText); });
            },
            function(/* err */) { /* ignore per-frame errors */ }
        ).then(function() {
            // Ждём 2 секунды, пока камера точно запустится, затем применяем фокус и зум
            setTimeout(function() {
                applyCameraConstraints(scanner);
            }, 2000);
        }).catch(function(err) {
            console.error('[BarcodeScanner] start failed:', err);
            safeStop();
            alert("Could not start camera: " + (err && err.message ? err.message : err));
        });

        document.getElementById('close-scanner').onclick = function() {
            safeStop();
        };
    }

    // ---------- Boot ----------
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachButton);
    } else {
        attachButton();
    }
})();