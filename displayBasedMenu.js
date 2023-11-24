/************************************************************************************************************
                 Display based menu script written by Mark Wilton-Jones - 28-30/05/2003
               Version 1.0.4 updated 28/06/2007 to work better in fixed position elements
*************************************************************************************************************

Please see http://www.howtocreate.co.uk/jslibs/ for details and a demo of this script
Please see http://www.howtocreate.co.uk/jslibs/termsOfUse.html for terms of use
_________________________________________________________________________

You can put as many menus on the page as you like. The menus will only appear in DOM based browsers.

The menus are specifically designed to work with my mini window script [v4.2+] - see http://www.howtocreate.co.uk

To use:
_________________________________________________________________________

Inbetween the <head> tags, put:

	<script src="PATH TO SCRIPT/displayBasedMenu.js" type="text/javascript" language="javascript1.2"></script>
	<script type="text/javascript" language="javascript1.2"><!--

//The following is an example of a menu which I have decided to call 'menuTree'

//create the menu object (normal right arrow image, highlight right arrow image)
var menuTree = new displayBasedMenu( "arrowRightBlack", "arrowRightWhite" );

//for a link to a sub-menu
//new displayBasedSub( "text" )
//you must add child items to its 'sub' collection

//for a menu item with a javascript action
//new displayBasedSub( "text", "someJavaScriptToBeExecutedWhenTheUserSelectsTheItem();" )

//create parents before children

menuTree.sub[0] = new displayBasedSub('File');
menuTree.sub[0].sub[0] = new displayBasedSub('New','alert(\'You chose \\\'New\\\'\')');
menuTree.sub[0].sub[1] = new displayBasedSub('Open');
menuTree.sub[0].sub[1].sub[0] = new displayBasedSub('From the World Wide Web');
menuTree.sub[0].sub[1].sub[0].sub[0] = new displayBasedSub('Intranet','window.open(\'http://127.0.0.1/\')');
menuTree.sub[0].sub[1].sub[0].sub[1] = new displayBasedSub('Internet','window.open(\'http://www.google.com/\')');
menuTree.sub[0].sub[1].sub[1] = new displayBasedSub('From disk','window.open(\'file://localhost/c:/\')');
menuTree.sub[0].sub[2] = new displayBasedSub('Close','hideMinWin( winObs.maxName )');
menuTree.sub[1] = new displayBasedSub('Edit');
menuTree.sub[1].sub[0] = new displayBasedSub('Cut','alert(\'Cannot cut\')');
menuTree.sub[1].sub[1] = new displayBasedSub('Copy','alert(\'Cannot copy\')');
menuTree.sub[1].sub[2] = new displayBasedSub('Paste','alert(\'Cannot paste\')');
menuTree.sub[2] = new displayBasedSub('Advanced');
menuTree.sub[2].sub[0] = new displayBasedSub('Options','if(confirm(\'Do you want to view the source code?\')){alert(document.body.innerHTML);}');
menuTree.sub[3] = new displayBasedSub('Help');
menuTree.sub[3].sub[0] = new displayBasedSub('About this program','alert(\'This program was written by Tarquin\');');

//write the menu (you can also use this along with my mini window script [v4.2+] to provide menus in the
//mini windows using the 'optional extra HTML' input variable - see http://www.howtocreate.co.uk)
document.write( menuTree.getMenuCode() );

	//--></script>

______________________________________________________________________________________________________*/

var isMenDown = false,
    levRefs = [],
    doneDisMenus = 0,
    theTTCTimeout;

function displayBasedMenu(oImg, oImg2) {
    var cacheImg1 = new Image(),
        cacheImg2 = new Image();
    cacheImg1.src = oImg;
    cacheImg2.src = oImg2;
    this.img = oImg;
    this.img2 = oImg2;
    this.sub = [];
    this.getMenuCode = function() {
        return getMenuCode(this);
    }
}

function displayBasedSub(oText, oScript) {
    this.text = oText;
    this.sub = [];
    this.script = oScript;
}

function getMenuCode(oMenuOb) {
    if (!document.childNodes) {
        return '';
    }
    doneDisMenus++;
    var oOutline = '<table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#bfbfbf;font-size:9pt;color:#000;font-family:Tahoma,Arial,sans-serif;cursor:default;"><tr><td style="width:0.5em;">&nbsp;</td>';
    for (var x = 0, oOutline2 = ''; x < oMenuOb.sub.length; x++) {
        oOutline += '<td style="width:' + oMenuOb.sub[x].text.length + 'em;" nowrap><span style="border:1px solid #bfbfbf;width:100%;' + (window.opera ? '' : 'display:block;') + '" onmouseover="doHighLight(this,\'disMen' +
            doneDisMenus + '_' + x + '\',1);" onmouseout="doLowLight(this,1);" onclick="popLow(this,\'disMen' + doneDisMenus + '_' + x +
            '\');">' + oMenuOb.sub[x].text + '</span></td>';
        oOutline2 += getSubMenuCode(oMenuOb.sub[x], 'disMen' + doneDisMenus + '_' + x, 2, oMenuOb.img, oMenuOb.img2);
    }
    return oOutline + '<td onclick="linkClick();">&nbsp;</td></tr></table>' + oOutline2;
}

function getSubMenuCode(oSubMenuOb, oUnique, oLev, oImg, oImg2) {
    if (!oSubMenuOb.sub.length) {
        return '';
    }
    var isIEMac = window.ActiveXObject && navigator.platform.indexOf('Mac') + 1 && !navigator.__ice_version && !window.opera;
    var oOutline = (isIEMac ? '' : ('<span style="position:absolute;display:none;" id="' + oUnique + '">')) +
        '<table border="0" cellpadding="3" cellspacing="0" style="background-color:#bfbfbf;border-bottom:1px solid #000;border-top:1px solid #ddd;border-left:1px solid #ddd;border-right:1px solid #000;font-size:9pt;color:#000;font-family:Tahoma,Arial,sans-serif;cursor:default;' + (isIEMac ? ('position:absolute;display:none;" id="' + oUnique + '"') : '"') + '>' +
        '<tr><td style="border-bottom:1px solid #888;border-top:1px solid #fff;border-left:1px solid #fff;border-right:1px solid #888;" nowrap>' + oSubMenuOb.text + ':</td></tr>';
    for (var x = 0, oOutline2 = ''; x < oSubMenuOb.sub.length; x++) {
        var theExtraBord = ((x == oSubMenuOb.sub.length - 1) ? 'border-bottom:1px solid #888;' : '') + (x ? '' : 'border-top:1px solid #fff;');
        if (oSubMenuOb.sub[x].script) {
            oOutline += '<tr><td style="' + theExtraBord + 'border-right:1px solid #888;border-left:1px solid #fff;width:100%;" onmouseover="doHighLight(this,\'' + oUnique + '_' + x + '\',' + oLev + ');" onclick="linkClick();eval(unescape(\'' + escape(oSubMenuOb.sub[x].script) + '\'));" nowrap width="100%">' + oSubMenuOb.sub[x].text + '</td></tr>';
        } else {
            oOutline += '<tr><td style="' + theExtraBord + 'border-right:1px solid #888;border-left:1px solid #fff;background-color:#bfbfbf;background-image:url(' + oImg + ');background-position:center right;background-repeat:no-repeat;" onmouseover="doHighLight(this,\'' + oUnique + '_' + x + '\',' + oLev + ',\'' + escape(oImg) + '\',\'' + escape(oImg2) + '\');" nowrap width="100%">' + (isIEMac ? '<span></span>' : '') + oSubMenuOb.sub[x].text + '&nbsp;</td></tr>';
            oOutline2 += getSubMenuCode(oSubMenuOb.sub[x], oUnique + '_' + x, oLev + 1, oImg, oImg2);
        }
    }
    return oOutline + '</table>' + (isIEMac ? '' : '</span>') + oOutline2;
}

function doHighLight(oOb, oOb2, oLevel, oImg, oImg2) {
    if (isMenDown) {
        window.clearTimeout(theTTCTimeout);
        theTTCTimeout = window.setTimeout('linkClick();', 5000);
        closeToLevel(oLevel);
        popLow2(oOb, document.getElementById(oOb2), oLevel, oImg, oImg2);
    } else if (oLevel == 1) {
        oOb.style.borderLeft = '1px solid #fff';
        oOb.style.borderTop = '1px solid #fff';
        oOb.style.borderRight = '1px solid #888';
        oOb.style.borderBottom = '1px solid #888';
    }
}

function doLowLight(oOb, oMenNum) {
    if (!isMenDown) {
        oOb.style.border = '1px solid #bfbfbf';
    }
}

function linkClick() {
    window.clearTimeout(theTTCTimeout);
    closeToLevel(1);
    isMenDown = false;
}

function popLow(oOb, oOb2) {
    closeToLevel(1);
    if (!isMenDown) {
        theTTCTimeout = window.setTimeout('linkClick();', 5000);
        isMenDown = true;
        popLow2(oOb, document.getElementById(oOb2), 1);
    } else {
        window.clearTimeout(theTTCTimeout);
        isMenDown = false;
        doHighLight(oOb, oOb2, 1);
    }
}

function popLow2(oOb, oOb2, oLevel, oImg, oImg2) {
    levRefs[oLevel] = [oOb, oOb2, oImg];
    if (oOb2) {
        oOb2.style.display = 'block';
        oOb2.style.zIndex = '2';
        rePos(oOb2, oOb, oLevel);
        if (window.opera) {
            oOb2.style.display = 'none';
            oOb2.style.display = 'block';
        }
    }
    if (oLevel - 1) {
        if (oImg2) {
            oOb.style.backgroundImage = 'url(' + unescape(oImg2) + ')';
        }
        oOb.style.backgroundColor = '#00007f';
        oOb.style.color = '#fff';
        if (window.opera) {
            oOb.style.display = 'none';
            oOb.style.display = 'table-cell';
        } //after opening child menus, v7.2+ fails to highlight cellpadding correctly
    } else {
        oOb.style.borderLeft = '1px solid #888';
        oOb.style.borderTop = '1px solid #888';
        oOb.style.borderRight = '1px solid #fff';
        oOb.style.borderBottom = '1px solid #fff';
    }
}

function closeToLevel(oLevel) {
    for (var x = levRefs.length - 1; x > oLevel - 1; x--) {
        if (levRefs[x]) {
            if (levRefs[x][1]) {
                levRefs[x][1].style.display = 'none';
            }
            if (x - 1) {
                if (levRefs[x][2]) {
                    levRefs[x][0].style.backgroundImage = 'url(' + unescape(levRefs[x][2]) + ')';
                }
                levRefs[x][0].style.backgroundColor = '#bfbfbf';
                levRefs[x][0].style.color = '#000';
            } else {
                levRefs[x][0].style.border = '1px solid #bfbfbf';
            }
            levRefs[x] = null;
        }
    }
}

function rePos(oObToPos, oObToRef, oLev) {
    var isIEMac = window.ActiveXObject && navigator.platform.indexOf('Mac') + 1 && !navigator.__ice_version && !window.opera;
    var theObToResize = isIEMac ? oObToPos : oObToPos.childNodes[0];
    if (isIEMac && oObToRef.childNodes[0].tagName) {
        oObToRef = oObToRef.childNodes[0];
    }
    if (theObToResize.offsetWidth < oObToRef.offsetWidth + ((oLev - 1) ? 0 : 50)) {
        theObToResize.setAttribute('width', (oObToRef.offsetWidth + ((oLev - 1) ? 0 : 50)) + 'px');
    }
    for (var posX = 0, posY = 0; oObToRef.style.position != 'absolute' && oObToRef.style.position != 'relative' && oObToRef.style.position != 'fixed' && oObToRef; oObToRef = oObToRef.offsetParent) {
        posX += oObToRef.offsetLeft;
        posY += oObToRef.offsetTop;
    }
    if (oLev - 1) {
        posX += (parseInt(oObToRef.style.left) + (isIEMac ? oObToRef : oObToRef.childNodes[0]).offsetWidth) - 3;
        posY += parseInt(oObToRef.style.top);
        posX -= isIEMac ? 2 : 0;
    } else {
        posY += isIEMac ? 12 : 17;
        posX -= isIEMac ? 5 : 0;
    }
    oObToPos.style.left = posX + 'px';
    oObToPos.style.top = posY + 'px';
}