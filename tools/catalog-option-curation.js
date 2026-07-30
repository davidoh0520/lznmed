(function () {
  var invalidOptionImages = new Set([
    "/tools/assets/catalog/options-20260728-v2/6c1662dc9316f6f3ea2a.webp",
    "/tools/assets/catalog/options-20260728-v2/44a098c4ff2e7bdedf04.webp"
  ]);

  function legacyModel(item) {
    return String(item && (item.legacyModel || item.model) || "");
  }

  function cleanOptions(items, field) {
    (items || []).forEach(function (item) {
      var curatedOptions = toolOptionCurations && (
        toolOptionCurations[legacyModel(item)] ||
        toolOptionCurations[String(item && item.model || "")]
      );
      if (curatedOptions) return;
      item[field] = (item[field] || []).filter(function (option) {
        return !invalidOptionImages.has(String(option && (option.image || option.src) || ""));
      });
    });
  }

  var originalCnCurations = {
  "LZN-651195961829": [
    "/tools/assets/catalog/curated-20260729/original-cn/651195961829/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/651195961829/002.webp"
  ],
  "LZN-TL-1001": [
    "/tools/assets/catalog/curated-20260729/original-cn/651195961829/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/651195961829/002.webp"
  ],
  "LZN-1014864659815": [
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/010.webp"
  ],
  "LZN-TL-1002": [
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/1014864659815/010.webp"
  ],
  "LZN-622631947328": [
    "/tools/assets/catalog/curated-20260729/original-cn/622631947328/001.webp"
  ],
  "LZN-TL-1003": [
    "/tools/assets/catalog/curated-20260729/original-cn/622631947328/001.webp"
  ],
  "LZN-723662946871": [
    "/tools/assets/catalog/curated-20260729/original-cn/723662946871/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723662946871/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723662946871/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723662946871/004.webp"
  ],
  "LZN-TL-1004": [
    "/tools/assets/catalog/curated-20260729/original-cn/723662946871/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723662946871/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723662946871/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723662946871/004.webp"
  ],
  "LZN-723282936906": [
    "/tools/assets/catalog/curated-20260729/original-cn/723282936906/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723282936906/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723282936906/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723282936906/004.webp"
  ],
  "LZN-TL-1005": [
    "/tools/assets/catalog/curated-20260729/original-cn/723282936906/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723282936906/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723282936906/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/723282936906/004.webp"
  ],
  "LZN-678366350023": [
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/009.webp"
  ],
  "LZN-TL-1006": [
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/678366350023/009.webp"
  ],
  "LZN-662993495475": [
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/016.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/017.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/018.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/019.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/020.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/021.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/022.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/023.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/024.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/025.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/026.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/027.webp"
  ],
  "LZN-TL-1007": [
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/016.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/017.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/018.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/019.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/020.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/021.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/022.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/023.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/024.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/025.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/026.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/662993495475/027.webp"
  ],
  "LZN-658527917520": [
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/006.webp"
  ],
  "LZN-TL-1008": [
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/658527917520/006.webp"
  ],
  "LZN-739604037804": [
    "/tools/assets/catalog/curated-20260729/original-cn/739604037804/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/739604037804/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/739604037804/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/739604037804/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/739604037804/005.webp"
  ],
  "LZN-TL-1009": [
    "/tools/assets/catalog/curated-20260729/original-cn/739604037804/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/739604037804/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/739604037804/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/739604037804/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/739604037804/005.webp"
  ],
  "LZN-634199062731": [
    "/tools/assets/catalog/curated-20260729/original-cn/634199062731/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/634199062731/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/634199062731/003.webp"
  ],
  "LZN-TL-1010": [
    "/tools/assets/catalog/curated-20260729/original-cn/634199062731/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/634199062731/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/634199062731/003.webp"
  ],
  "LZN-585323017499": [
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/011.webp"
  ],
  "LZN-TL-1011": [
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/585323017499/011.webp"
  ],
  "LZN-691330957794": [
    "/tools/assets/catalog/curated-20260729/original-cn/691330957794/001.webp"
  ],
  "LZN-TL-1012": [
    "/tools/assets/catalog/curated-20260729/original-cn/691330957794/001.webp"
  ],
  "LZN-612244347689": [
    "/tools/assets/catalog/curated-202€ù:“⁄$z{-ÆÈ‹j◊ù20260729/frames/587119337526/001.webp"
    },
    {
      "label": "Matte Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587119337526/002.webp"
    },
    {
      "label": "Brown",
      "image": "/tools/assets/catalog/curated-20260729/frames/587119337526/003.webp"
    },
    {
      "label": "Tortoiseshell",
      "image": "/tools/assets/catalog/curated-20260729/frames/587119337526/004.webp"
    }
  ],
  "LZN-587120645670": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587120645670/001.webp"
    },
    {
      "label": "Rose Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587120645670/002.webp"
    }
  ],
  "LZN-587120689912": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587120689912/001.webp"
    },
    {
      "label": "Black / Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587120689912/002.webp"
    },
    {
      "label": "Rose Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587120689912/003.webp"
    }
  ],
  "LZN-587124733244": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587124733244/001.webp"
    },
    {
      "label": "Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587124733244/002.webp"
    },
    {
      "label": "Gunmetal",
      "image": "/tools/assets/catalog/curated-20260729/frames/587124733244/003.webp"
    },
    {
      "label": "Brown",
      "image": "/tools/assets/catalog/curated-20260729/frames/587124733244/004.webp"
    }
  ],
  "LZN-587126509758": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587126509758/001.webp"
    },
    {
      "label": "Black / Red",
      "image": "/tools/assets/catalog/curated-20260729/frames/587126509758/002.webp"
    },
    {
      "label": "Black / Blue",
      "image": "/tools/assets/catalog/curated-20260729/frames/587126509758/003.webp"
    },
    {
      "label": "Black / Green",
      "image": "/tools/assets/catalog/curated-20260729/frames/587126509758/004.webp"
    },
    {
      "label": "Black / Orange",
      "image": "/tools/assets/catalog/curated-20260729/frames/587126509758/005.webp"
    }
  ],
  "LZN-587129289683": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587129289683/001.webp"
    },
    {
      "label": "Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587129289683/002.webp"
    },
    {
      "label": "Black / Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587129289683/003.webp"
    },
    {
      "label": "Brown / Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587129289683/004.webp"
    },
    {
      "label": "Black / Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587129289683/005.webp"
    },
    {
      "label": "Blue / Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587129289683/006.webp"
    }
  ],
  "LZN-587140605654": [
    {
      "label": "Red",
      "image": "/tools/assets/catalog/curated-20260729/frames/587140605654/001.webp"
    },
    {
      "label": "Pink",
      "image": "/tools/assets/catalog/curated-20260729/frames/587140605654/002.webp"
    },
    {
      "label": "Purple",
      "image": "/tools/assets/catalog/curated-20260729/frames/587140605654/003.webp"
    }
  ],
  "LZN-587254638818": [
    {
      "label": "Glossy Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587254638818/001.webp"
    },
    {
      "label": "Matte Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587254638818/002.webp"
    },
    {
      "label": "Blue",
      "image": "/tools/assets/catalog/curated-20260729/frames/587254638818/003.webp"
    },
    {
      "label": "Purple",
      "image": "/tools/assets/catalog/curated-20260729/frames/587254638818/004.webp"
    },
    {
      "label": "Red",
      "image": "/tools/assets/catalog/curated-20260729/frames/587254638818/005.webp"
    }
  ],
  "LZN-587257070194": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587257070194/001.webp"
    },
    {
      "label": "Gunmetal",
      "image": "/tools/assets/catalog/curated-20260729/frames/587257070194/002.webp"
    },
    {
      "label": "Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587257070194/003.webp"
    },
    {
      "label": "Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587257070194/004.webp"
    },
    {
      "label": "Blue",
      "image": "/tools/assets/catalog/curated-20260729/frames/587257070194/005.webp"
    }
  ],
  "LZN-587260062252": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587260062252/001.webp"
    },
    {
      "label": "Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587260062252/002.webp"
    },
    {
      "label": "Gunmetal",
      "image": "/tools/assets/catalog/curated-20260729/frames/587260062252/003.webp"
    },
    {
      "label": "Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587260062252/004.webp"
    },
    {
      "label": "Brown",
      "image": "/tools/assets/catalog/curated-20260729/frames/587260062252/005.webp"
    }
  ],
  "LZN-587260434435": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587260434435/001.webp"
    },
    {
      "label": "Rose Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587260434435/002.webp"
    },
    {
      "label": "Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587260434435/003.webp"
    },
    {
      "label": "Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587260434435/004.webp"
    }
  ],
  "LZN-587264550556": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587264550556/001.webp"
    },
    {
      "label": "Black / Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587264550556/002.webp"
    },
    {
      "label": "Black / Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587264550556/003.webp"
    },
    {
      "label": "Black / Rose Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587264550556/004.webp"
    },
    {
      "label": "Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587264550556/005.webp"
    },
    {
      "label": "Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587264550556/006.webp"
    },
    {
      "label": "Rose Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587264550556/007.webp"
    }
  ],
  "LZN-587407599762": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587407599762/001.webp"
    },
    {
      "label": "Gunmetal",
      "image": "/tools/assets/catalog/curated-20260729/frames/587407599762/002.webp"
    },
    {
      "label": "Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587407599762/003.webp"
    },
    {
      "label": "Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587407599762/004.webp"
    },
    {
      "label": "Brown",
      "image": "/tools/assets/catalog/curated-20260729/frames/587407599762/005.webp"
    }
  ],
  "LZN-587408143171": [
    {
      "label": "Black Frame / Black Temples",
      "image": "/tools/assets/catalog/curated-20260729/frames/587408143171/001.webp"
    },
    {
      "label": "Black Frame / Silver Temples",
      "image": "/tools/assets/catalog/curated-20260729/frames/587408143171/002.webp"
    },
    {
      "label": "Gray",
      "image": "/tools/assets/catalog/curated-20260729/frames/587408143171/003.webp"
    },
    {
      "label": "Blue",
      "image": "/tools/assets/catalog/curated-20260729/frames/587408143171/004.webp"
    },
    {
      "label": "Brown",
      "image": "/tools/assets/catalog/curated-20260729/frames/587408143171/005.webp"
    },
    {
      "label": "Tortoiseshell",
      "image": "/tools/assets/catalog/curated-20260729/frames/587408143171/006.webp"
    }
  ],
  "LZN-587412731820": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587412731820/001.webp"
    },
    {
      "label": "Black / Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587412731820/003.webp"
    }
  ],
  "LZN-587415271348": [
    {
      "label": "Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587415271348/001.webp"
    },
    {
      "label": "Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/587415271348/002.webp"
    },
    {
      "label": "Rose Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/587415271348/003.webp"
    }
  ],
  "LZN-597780283226": [
    {
      "label": "Matte Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/597780283226/002.webp"
    },
    {
      "label": "Glossy Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/597780283226/003.webp"
    },
    {
      "label": "Black / Purple Temples",
      "image": "/tools/assets/catalog/curated-20260729/frames/597780283226/004.webp"
    },
    {
      "label": "Black / Blue Temples",
      "image": "/tools/assets/catalog/curated-20260729/frames/597780283226/005.webp"
    },
    {
      "label": "Transparent Gray",
      "image": "/tools/assets/catalog/curated-20260729/frames/597780283226/006.webp"
    },
    {
      "label": "Black / Pink Temples",
      "image": "/tools/assets/catalog/curated-20260729/frames/597780283226/007.webp"
    }
  ],
  "LZN-598475231744": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/598475231744/001.webp"
    },
    {
      "label": "Gunmetal",
      "image": "/tools/assets/catalog/curated-20260729/frames/598475231744/002.webp"
    },
    {
      "label": "Brown",
      "image": "/tools/assets/catalog/curated-20260729/frames/598475231744/003.webp"
    }
  ],
  "LZN-603072046301": [
    {
      "label": "Clear",
      "image": "/tools/assets/catalog/curated-20260729/frames/603072046301/001.webp"
    },
    {
      "label": "Transparent Purple",
      "image": "/tools/assets/catalog/curated-20260729/frames/603072046301/002.webp"
    },
    {
      "label": "Transparent Pink",
      "image": "/tools/assets/catalog/curated-20260729/frames/603072046301/003.webp"
    },
    {
      "label": "Transparent Brown",
      "image": "/tools/assets/catalog/curated-20260729/frames/603072046301/004.webp"
    }
  ],
  "LZN-612626259779": [
    {
      "label": "Clear",
      "image": "/tools/assets/catalog/curated-20260729/frames/612626259779/002.webp"
    },
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/612626259779/003.webp"
    },
    {
      "label": "Black - Wide Coverage",
      "image": "/tools/assets/catalog/curated-20260729/frames/612626259779/004.webp"
    },
    {
      "label": "Blue",
      "image": "/tools/assets/catalog/curated-20260729/frames/612626259779/005.webp"
    }
  ],
  "LZN-616066567397": [
    {
      "label": "Black / Gray",
      "image": "/tools/assets/catalog/curated-20260729/frames/616066567397/002.webp"
    },
    {
      "label": "Black / Gradient Gray",
      "image": "/tools/assets/catalog/curated-20260729/frames/616066567397/003.webp"
    },
    {
      "label": "Black / Silver Mirror",
      "image": "/tools/assets/catalog/curated-20260729/frames/616066567397/004.webp"
    },
    {
      "label": "Green / Gray",
      "image": "/tools/assets/catalog/curated-20260729/frames/616066567397/005.webp"
    }
  ],
  "LZN-674195459982": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/674195459982/002.webp"
    },
    {
      "label": "Blue",
      "image": "/tools/assets/catalog/curated-20260729/frames/674195459982/003.webp"
    },
    {
      "label": "Clear Gray",
      "image": "/tools/assets/catalog/curated-20260729/frames/674195459982/004.webp"
    },
    {
      "label": "Clear White",
      "image": "/tools/assets/catalog/curated-20260729/frames/674195459982/005.webp"
    },
    {
      "label": "Clear Blue",
      "image": "/tools/assets/catalog/curated-20260729/frames/674195459982/006.webp"
    }
  ],
  "LZN-735776235143": [
    {
      "label": "Black / Yellow and Gray Lens Set",
      "image": "/tools/assets/catalog/curated-20260729/frames/735776235143/001.webp"
    },
    {
      "label": "Black / White / Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/735776235143/002.webp"
    },
    {
      "label": "Black / Red / Mirror",
      "image": "/tools/assets/catalog/curated-20260729/frames/735776235143/003.webp"
    },
    {
      "label": "Black / Gray",
      "image": "/tools/assets/catalog/curated-20260729/frames/735776235143/004.webp"
    },
    {
      "label": "Black / Blue / Mirror",
      "image": "/tools/assets/catalog/curated-20260729/frames/735776235143/005.webp"
    },
    {
      "label": "Black / Yellow Lens",
      "image": "/tools/assets/catalog/curated-20260729/frames/735776235143/006.webp"
    },
    {
      "label": "Black / Red / Mirror - Alternate",
      "image": "/tools/assets/catalog/curated-20260729/frames/735776235143/007.webp"
    }
  ]
};

  frameSeries.forEach(function (series) {
    (series.items || []).forEach(function (item) {
      var curated = frameCurations[legacyModel(item)];
      if (!curated) return;
      var oldColors = item.colors || [];
      item.colors = curated.map(function (choice, index) {
        var old = oldColors[Math.min(index, Math.max(0, oldColors.length - 1))] || {};
        var number = String(index + 1).padStart(2, "0");
        return {
          key: String(item.model || legacyModel(item)).toLowerCase() + "-c" + number,
          legacyKey: old.legacyKey || old.key || "",
          en: choice.label,
          ko: choice.label,
          label: choice.label,
          name: choice.label,
          src: choice.image,
          image: choice.image,
          priceUsd: Number(old.priceUsd || item.priceUsd || 0)
        };
      });
      item.image = curated[0].image;
      item.title = curated[0].image;
      item.images = curated.map(function (choice) { return choice.image; });
    });
  });

})();
