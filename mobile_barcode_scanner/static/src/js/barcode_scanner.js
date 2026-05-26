(function() {
    var lastFocusedField = null;
    var pendingScanResult = null;

    function initFocusTracker() {
        document.addEventListener('focusin', function(event) {
            var target = event.target;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
                lastFocusedField = target;
                console.log("Last focused field saved", lastFocusedField);
            }
        });
    }

    function attachButton() {
        if (document.querySelector('.o_barcode_scanner_button')) return;
        var button = document.createElement('div');
        button.className = 'o_barcode_scanner_button';
        button.innerHTML = '📷';
        button.onclick = function() {
            if (lastFocusedField) {
                startScan();
            } else {
                alert("Please click inside a text field first (barcode field, product name, etc.)");
            }
        };
        document.body.appendChild(button);
        console.log("Scanner button attached");
        initFocusTracker();
    }

    function startScan() {
        if (typeof Html5Qrcode === 'undefined') {
            alert("Scanner library not loaded. Please refresh the page.");
            return;
        }
        var overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.9)';
        overlay.style.zIndex = '100000';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.innerHTML = '<div id="qr-reader" style="width: 90%; max-width: 500px;"></div><button id="close-scanner" style="margin-top:20px; padding:10px 20px; background:white; border:none; border-radius:5px;">Close</button>';
        document.body.appendChild(overlay);

        var scanner = new Html5Qrcode("qr-reader");
        var config = { fps: 10, qrbox: { width: 250, height: 250 } };
        scanner.start({ facingMode: "environment" }, config, function(decodedText) {
            scanner.stop();
            document.body.removeChild(overlay);
            if (lastFocusedField && document.body.contains(lastFocusedField)) {
                lastFocusedField.value = decodedText;
                lastFocusedField.dispatchEvent(new Event('input', { bubbles: true }));
                lastFocusedField.dispatchEvent(new Event('change', { bubbles: true }));
                lastFocusedField.focus();
                console.log("Value inserted into field", lastFocusedField);
            } else {
                pendingScanResult = decodedText;
                alert("Scanned: " + decodedText + "\nNow click into any text field to paste the value.");
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
        }, function(err) {});
        document.getElementById('close-scanner').onclick = function() {
            scanner.stop();
            document.body.removeChild(overlay);
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachButton);
    } else {
        attachButton();
    }
})();
