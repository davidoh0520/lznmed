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
    "/tools/assets/catalog/curated-20260801/english/651195961829/gray-100-pack.webp",
    "/tools/assets/catalog/curated-20260801/english/651195961829/white-10-pack.webp"
  ],
  "LZN-TL-1001": [
    "/tools/assets/catalog/curated-20260801/english/651195961829/gray-100-pack.webp",
    "/tools/assets/catalog/curated-20260801/english/651195961829/white-10-pack.webp"
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
    "/tools/assets/catalog/curated-20260801/english/622631947328/cute-star-travel-case.webp"
  ],
  "LZN-TL-1003": [
    "/tools/assets/catalog/curated-20260801/english/622631947328/cute-star-travel-case.webp"
  ],
  "LZN-723662946871": [
    "/tools/assets/catalog/curated-20260801/english/723662946871/gray-square-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723662946871/pink-square-winged-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723662946871/pink-square-wand-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723662946871/gray-square-wand-star.webp"
  ],
  "LZN-TL-1004": [
    "/tools/assets/catalog/curated-20260801/english/723662946871/gray-square-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723662946871/pink-square-winged-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723662946871/pink-square-wand-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723662946871/gray-square-wand-star.webp"
  ],
  "LZN-723282936906": [
    "/tools/assets/catalog/curated-20260801/english/723282936906/pink-round-wand-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723282936906/white-pink-round-winged-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723282936906/pink-square-wand-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723282936906/gray-square-wand-star.webp"
  ],
  "LZN-TL-1005": [
    "/tools/assets/catalog/curated-20260801/english/723282936906/pink-round-wand-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723282936906/white-pink-round-winged-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723282936906/pink-square-wand-star.webp",
    "/tools/assets/catalog/curated-20260801/english/723282936906/gray-square-wand-star.webp"
  ],
  "LZN-678366350023": [
    "/tools/assets/catalog/curated-20260801/english/678366350023/gray-tray.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/green-tray.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/yellow-tray.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/gray-tray-empty-bottle.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/green-tray-empty-bottle.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/yellow-tray-empty-bottle.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/white-tray.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/white-tray-empty-bottle.webp"
  ],
  "LZN-TL-1006": [
    "/tools/assets/catalog/curated-20260801/english/678366350023/gray-tray.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/green-tray.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/yellow-tray.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/gray-tray-empty-bottle.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/green-tray-empty-bottle.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/yellow-tray-empty-bottle.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/white-tray.webp",
    "/tools/assets/catalog/curated-20260801/english/678366350023/white-tray-empty-bottle.webp"
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
    "/tools/assets/catalog/curated-20260801/english/658527917520/clear-250ml.webp",
    "/tools/assets/catalog/curated-20260801/english/658527917520/clear-500ml.webp",
    "/tools/assets/catalog/curated-20260801/english/658527917520/blue-250ml.webp",
    "/tools/assets/catalog/curated-20260801/english/658527917520/pink-250ml.webp"
  ],
  "LZN-TL-1008": [
    "/tools/assets/catalog/curated-20260801/english/658527917520/clear-250ml.webp",
    "/tools/assets/catalog/curated-20260801/english/658527917520/clear-500ml.webp",
    "/tools/assets/catalog/curated-20260801/english/658527917520/blue-250ml.webp",
    "/tools/assets/catalog/curated-20260801/english/658527917520/pink-250ml.webp"
  ],
  "LZN-739604037804": [
    "/tools/assets/catalog/curated-20260801/english/739604037804/one-pair-set.webp",
    "/tools/assets/catalog/curated-20260801/english/739604037804/three-pair-set.webp",
    "/tools/assets/catalog/curated-20260801/english/739604037804/five-pair-set.webp",
    "/tools/assets/catalog/curated-20260801/english/739604037804/seven-pair-set.webp"
  ],
  "LZN-TL-1009": [
    "/tools/assets/catalog/curated-20260801/english/739604037804/one-pair-set.webp",
    "/tools/assets/catalog/curated-20260801/english/739604037804/three-pair-set.webp",
    "/tools/assets/catalog/curated-20260801/english/739604037804/five-pair-set.webp",
    "/tools/assets/catalog/curated-20260801/english/739604037804/seven-pair-set.webp"
  ],
  "LZN-634199062731": [
    "/tools/assets/catalog/curated-20260801/english/634199062731/temple-arms-screwdriver-screws.webp",
    "/tools/assets/catalog/curated-20260801/english/634199062731/temple-arms-screwdriver-screws-file.webp"
  ],
  "LZN-TL-1010": [
    "/tools/assets/catalog/curated-20260801/english/634199062731/temple-arms-screwdriver-screws.webp",
    "/tools/assets/catalog/curated-20260801/english/634199062731/temple-arms-screwdriver-screws-file.webp"
  ],
  "LZN-585323017499": [
    "/tools/assets/catalog/curated-20260801/english/585323017499/black-fabric.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/green-camouflage.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/silver-pink.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/silver-red.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/silver-gray.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/silver-brown.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/hot-pink.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/woven-black.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/smooth-black.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/yellow.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/deep-blue.webp"
  ],
  "LZN-TL-1011": [
    "/tools/assets/catalog/curated-20260801/english/585323017499/black-fabric.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/green-camouflage.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/silver-pink.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/silver-red.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/silver-gray.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/silver-brown.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/hot-pink.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/woven-black.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/smooth-black.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/yellow.webp",
    "/tools/assets/catalog/curated-20260801/english/585323017499/deep-blue.webp"
  ],
  "LZN-691330957794": [
    "/tools/assets/catalog/curated-20260801/english/691330957794/natural-wood.webp"
  ],
  "LZN-TL-1012": [
    "/tools/assets/catalog/curated-20260801/english/691330957794/natural-wood.webp"
  ],
  "LZN-612244347689": [
    "/tools/assets/catalog/curated-20260801/english/612244347689/pearl-white.webp",
    "/tools/assets/catalog/curated-20260801/english/612244347689/piano-black.webp",
    "/tools/assets/catalog/curated-20260801/english/612244347689/cherry-blossom-pink.webp",
    "/tools/assets/catalog/curated-20260801/english/612244347689/sky-blue.webp"
  ],
  "LZN-TL-1013": [
    "/tools/assets/catalog/curated-20260801/english/612244347689/pearl-white.webp",
    "/tools/assets/catalog/curated-20260801/english/612244347689/piano-black.webp",
    "/tools/assets/catalog/curated-20260801/english/612244347689/cherry-blossom-pink.webp",
    "/tools/assets/catalog/curated-20260801/english/612244347689/sky-blue.webp"
  ],
  "LZN-675965294746": [
    "/tools/assets/catalog/curated-20260801/english/675965294746/light-pink-dark-pink.webp",
    "/tools/assets/catalog/curated-20260801/english/675965294746/light-purple-black.webp",
    "/tools/assets/catalog/curated-20260801/english/675965294746/light-purple-dark-purple.webp"
  ],
  "LZN-TL-1014": [
    "/tools/assets/catalog/curated-20260801/english/675965294746/light-pink-dark-pink.webp",
    "/tools/assets/catalog/curated-20260801/english/675965294746/light-purple-black.webp",
    "/tools/assets/catalog/curated-20260801/english/675965294746/light-purple-dark-purple.webp"
  ],
  "LZN-674373644031": [
    "/tools/assets/catalog/curated-20260729/original-cn/674373644031/001.webp"
  ],
  "LZN-TL-1015": [
    "/tools/assets/catalog/curated-20260729/original-cn/674373644031/001.webp"
  ],
  "LZN-625178269004": [
    "/tools/assets/catalog/curated-20260801/english/625178269004/temple-arms-standard.webp",
    "/tools/assets/catalog/curated-20260801/english/625178269004/temple-arms-ear-hooks.webp",
    "/tools/assets/catalog/curated-20260801/english/625178269004/temple-arms-nose-pads.webp"
  ],
  "LZN-TL-1016": [
    "/tools/assets/catalog/curated-20260801/english/625178269004/temple-arms-standard.webp",
    "/tools/assets/catalog/curated-20260801/english/625178269004/temple-arms-ear-hooks.webp",
    "/tools/assets/catalog/curated-20260801/english/625178269004/temple-arms-nose-pads.webp"
  ],
  "LZN-739604309325": [
    "/tools/assets/catalog/curated-20260730/english/739604309325/black.webp",
    "/tools/assets/catalog/curated-20260730/english/739604309325/taupe.webp",
    "/tools/assets/catalog/curated-20260730/english/739604309325/light-gray.webp",
    "/tools/assets/catalog/curated-20260730/english/739604309325/brown.webp"
  ],
  "LZN-TL-1017": [
    "/tools/assets/catalog/curated-20260730/english/739604309325/black.webp",
    "/tools/assets/catalog/curated-20260730/english/739604309325/taupe.webp",
    "/tools/assets/catalog/curated-20260730/english/739604309325/light-gray.webp",
    "/tools/assets/catalog/curated-20260730/english/739604309325/brown.webp"
  ],
  "LZN-626769523006": [
    "/tools/assets/catalog/curated-20260729/original-cn/626769523006/001.webp"
  ],
  "LZN-TL-1018": [
    "/tools/assets/catalog/curated-20260729/original-cn/626769523006/001.webp"
  ],
  "LZN-607829059398": [
    "/tools/assets/catalog/curated-20260801/english/607829059398/light-pink-red-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/magenta-white-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/yellow-red-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/blue-white-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/light-gray-red-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/light-gray-yellow-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/dark-gray-yellow-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/purple-white-stitch.webp"
  ],
  "LZN-TL-1019": [
    "/tools/assets/catalog/curated-20260801/english/607829059398/light-pink-red-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/magenta-white-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/yellow-red-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/blue-white-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/light-gray-red-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/light-gray-yellow-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/dark-gray-yellow-stitch.webp",
    "/tools/assets/catalog/curated-20260801/english/607829059398/purple-white-stitch.webp"
  ],
  "LZN-693999897346": [
    "/tools/assets/catalog/curated-20260729/original-cn/693999897346/001.webp"
  ],
  "LZN-TL-1020": [
    "/tools/assets/catalog/curated-20260729/original-cn/693999897346/001.webp"
  ],
  "LZN-592494388948": [
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/016.webp"
  ],
  "LZN-TL-1021": [
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/592494388948/016.webp"
  ],
  "LZN-605818164392": [
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/016.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/017.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/018.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/019.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/020.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/021.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/022.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/023.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/024.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/025.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/026.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/027.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/028.webp"
  ],
  "LZN-TL-1022": [
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/016.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/017.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/018.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/019.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/020.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/021.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/022.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/023.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/024.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/025.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/026.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/027.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/605818164392/028.webp"
  ],
  "LZN-642715540809": [
    "/tools/assets/catalog/curated-20260729/original-cn/642715540809/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/642715540809/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/642715540809/003.webp"
  ],
  "LZN-TL-1023": [
    "/tools/assets/catalog/curated-20260729/original-cn/642715540809/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/642715540809/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/642715540809/003.webp"
  ],
  "LZN-965566416870": [
    "/tools/assets/catalog/curated-20260729/original-cn/965566416870/001.webp"
  ],
  "LZN-TL-1024": [
    "/tools/assets/catalog/curated-20260729/original-cn/965566416870/001.webp"
  ],
  "LZN-624275864051": [
    "/tools/assets/catalog/curated-20260729/original-cn/624275864051/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/624275864051/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/624275864051/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/624275864051/004.webp"
  ],
  "LZN-TL-1025": [
    "/tools/assets/catalog/curated-20260729/original-cn/624275864051/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/624275864051/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/624275864051/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/624275864051/004.webp"
  ],
  "LZN-675276708992": [
    "/tools/assets/catalog/curated-20260729/original-cn/675276708992/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/675276708992/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/675276708992/003.webp"
  ],
  "LZN-TL-1026": [
    "/tools/assets/catalog/curated-20260729/original-cn/675276708992/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/675276708992/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/675276708992/003.webp"
  ],
  "LZN-696035777060": [
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/016.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/017.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/018.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/019.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/020.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/021.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/022.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/023.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/024.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/025.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/026.webp"
  ],
  "LZN-TL-1027": [
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/016.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/017.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/018.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/019.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/020.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/021.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/022.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/023.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/024.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/025.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/696035777060/026.webp"
  ],
  "LZN-595399753758": [
    "/tools/assets/catalog/curated-20260729/original-cn/595399753758/001.webp"
  ],
  "LZN-TL-1029": [
    "/tools/assets/catalog/curated-20260729/original-cn/595399753758/001.webp"
  ],
  "LZN-685253897109": [
    "/tools/assets/catalog/curated-20260729/original-cn/685253897109/001.webp"
  ],
  "LZN-TL-1030": [
    "/tools/assets/catalog/curated-20260729/original-cn/685253897109/001.webp"
  ],
  "LZN-598559007116": [
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/016.webp"
  ],
  "LZN-TL-1031": [
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/598559007116/016.webp"
  ],
  "LZN-610342838181": [
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/016.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/017.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/018.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/019.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/020.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/021.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/022.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/023.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/024.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/025.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/026.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/027.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/028.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/029.webp"
  ],
  "LZN-TL-1032": [
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/016.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/017.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/018.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/019.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/020.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/021.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/022.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/023.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/024.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/025.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/026.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/027.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/028.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/610342838181/029.webp"
  ],
  "LZN-684620908475": [
    "/tools/assets/catalog/curated-20260729/original-cn/684620908475/001.webp"
  ],
  "LZN-TL-1033": [
    "/tools/assets/catalog/curated-20260729/original-cn/684620908475/001.webp"
  ],
  "LZN-602357189850": [
    "/tools/assets/catalog/curated-20260801/english/602357189850/white.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/orange.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/red.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/green.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/purple.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/brown.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/pink.webp"
  ],
  "LZN-TL-1034": [
    "/tools/assets/catalog/curated-20260801/english/602357189850/white.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/orange.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/red.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/green.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/purple.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/brown.webp",
    "/tools/assets/catalog/curated-20260801/english/602357189850/pink.webp"
  ],
  "LZN-777094994614": [
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/013.webp"
  ],
  "LZN-TL-1035": [
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/777094994614/013.webp"
  ],
  "LZN-737807180518": [
    "/tools/assets/catalog/curated-20260729/original-cn/737807180518/001.webp"
  ],
  "LZN-TL-1036": [
    "/tools/assets/catalog/curated-20260729/original-cn/737807180518/001.webp"
  ],
  "LZN-717183914442": [
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/016.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/017.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/018.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/019.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/020.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/021.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/022.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/023.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/024.webp"
  ],
  "LZN-TL-1037": [
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/013.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/014.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/016.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/017.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/018.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/019.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/020.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/021.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/022.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/023.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/717183914442/024.webp"
  ],
  "LZN-602743600864": [
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/012.webp"
  ],
  "LZN-TL-1038": [
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/602743600864/012.webp"
  ],
  "LZN-635408516585": [
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/025.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/026.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/027.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/034.webp"
  ],
  "LZN-TL-1039": [
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/011.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/012.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/015.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/025.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/026.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/027.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/635408516585/034.webp"
  ],
  "LZN-607384329144": [
    "/tools/assets/catalog/curated-20260729/original-cn/607384329144/001.webp"
  ],
  "LZN-TL-1040": [
    "/tools/assets/catalog/curated-20260729/original-cn/607384329144/001.webp"
  ],
  "LZN-669731145847": [
    "/tools/assets/catalog/curated-20260801/english/669731145847/polishing-cloth.webp"
  ],
  "LZN-TL-1041": [
    "/tools/assets/catalog/curated-20260801/english/669731145847/polishing-cloth.webp"
  ],
  "LZN-676143210189": [
    "/tools/assets/catalog/curated-20260729/original-cn/676143210189/001.webp"
  ],
  "LZN-TL-1042": [
    "/tools/assets/catalog/curated-20260729/original-cn/676143210189/001.webp"
  ],
  "LZN-691677973956": [
    "/tools/assets/catalog/curated-20260801/english/691677973956/frosted-square-case.webp",
    "/tools/assets/catalog/curated-20260801/english/691677973956/frosted-oval-case.webp"
  ],
  "LZN-TL-1043": [
    "/tools/assets/catalog/curated-20260801/english/691677973956/frosted-square-case.webp",
    "/tools/assets/catalog/curated-20260801/english/691677973956/frosted-oval-case.webp"
  ],
  "LZN-642715432999": [
    "/tools/assets/catalog/curated-20260801/english/642715432999/lacquered-black.webp",
    "/tools/assets/catalog/curated-20260801/english/642715432999/black.webp",
    "/tools/assets/catalog/curated-20260801/english/642715432999/beige.webp",
    "/tools/assets/catalog/curated-20260801/english/642715432999/solid-blue.webp",
    "/tools/assets/catalog/curated-20260801/english/642715432999/clear.webp",
    "/tools/assets/catalog/curated-20260801/english/642715432999/transparent-pink.webp"
  ],
  "LZN-TL-1044": [
    "/tools/assets/catalog/curated-20260801/english/642715432999/lacquered-black.webp",
    "/tools/assets/catalog/curated-20260801/english/642715432999/black.webp",
    "/tools/assets/catalog/curated-20260801/english/642715432999/beige.webp",
    "/tools/assets/catalog/curated-20260801/english/642715432999/solid-blue.webp",
    "/tools/assets/catalog/curated-20260801/english/642715432999/clear.webp",
    "/tools/assets/catalog/curated-20260801/english/642715432999/transparent-pink.webp"
  ],
  "LZN-763152459242": [
    "/tools/assets/catalog/curated-20260801/english/763152459242/white.webp",
    "/tools/assets/catalog/curated-20260801/english/763152459242/pink.webp",
    "/tools/assets/catalog/curated-20260801/english/763152459242/yellow.webp"
  ],
  "LZN-TL-1046": [
    "/tools/assets/catalog/curated-20260801/english/763152459242/white.webp",
    "/tools/assets/catalog/curated-20260801/english/763152459242/pink.webp",
    "/tools/assets/catalog/curated-20260801/english/763152459242/yellow.webp"
  ],
  "LZN-694016088201": [
    "/tools/assets/catalog/curated-20260801/english/694016088201/champagne-gold-glitter.webp",
    "/tools/assets/catalog/curated-20260801/english/694016088201/silver-glitter.webp"
  ],
  "LZN-TL-1047": [
    "/tools/assets/catalog/curated-20260801/english/694016088201/champagne-gold-glitter.webp",
    "/tools/assets/catalog/curated-20260801/english/694016088201/silver-glitter.webp"
  ],
  "LZN-594962368226": [
    "/tools/assets/catalog/curated-20260801/english/594962368226/red.webp",
    "/tools/assets/catalog/curated-20260801/english/594962368226/yellow.webp",
    "/tools/assets/catalog/curated-20260801/english/594962368226/gray.webp",
    "/tools/assets/catalog/curated-20260801/english/594962368226/blue.webp",
    "/tools/assets/catalog/curated-20260801/english/594962368226/silver-gray.webp"
  ],
  "LZN-TL-1048": [
    "/tools/assets/catalog/curated-20260801/english/594962368226/red.webp",
    "/tools/assets/catalog/curated-20260801/english/594962368226/yellow.webp",
    "/tools/assets/catalog/curated-20260801/english/594962368226/gray.webp",
    "/tools/assets/catalog/curated-20260801/english/594962368226/blue.webp",
    "/tools/assets/catalog/curated-20260801/english/594962368226/silver-gray.webp"
  ],
  "LZN-617968191574": [
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/011.webp"
  ],
  "LZN-TL-1049": [
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/001.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/002.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/003.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/004.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/005.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/006.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/007.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/008.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/009.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/010.webp",
    "/tools/assets/catalog/curated-20260729/original-cn/617968191574/011.webp"
  ]
};

  var toolOptionCurations = {
    "LZN-651195961829": [
      {
        label: "Option 01 - Gray, 100-Pack",
        image: "/tools/assets/catalog/curated-20260801/english/651195961829/gray-100-pack.webp"
      },
      {
        label: "Option 02 - White, 10-Pack",
        image: "/tools/assets/catalog/curated-20260801/english/651195961829/white-10-pack.webp"
      }
    ],
    "LZN-622631947328": [
      {
        label: "Option 01 - Assorted Star Travel Case",
        image: "/tools/assets/catalog/curated-20260801/english/622631947328/cute-star-travel-case.webp"
      }
    ],
    "LZN-723662946871": [
      {
        label: "Option 01 - Gray Square Star",
        image: "/tools/assets/catalog/curated-20260801/english/723662946871/gray-square-star.webp"
      },
      {
        label: "Option 02 - Pink Square Winged Star",
        image: "/tools/assets/catalog/curated-20260801/english/723662946871/pink-square-winged-star.webp"
      },
      {
        label: "Option 03 - Pink Square Wand Star",
        image: "/tools/assets/catalog/curated-20260801/english/723662946871/pink-square-wand-star.webp"
      },
      {
        label: "Option 04 - Gray Square Wand Star",
        image: "/tools/assets/catalog/curated-20260801/english/723662946871/gray-square-wand-star.webp"
      }
    ],
    "LZN-723282936906": [
      {
        label: "Option 01 - Pink Round Wand Star",
        image: "/tools/assets/catalog/curated-20260801/english/723282936906/pink-round-wand-star.webp"
      },
      {
        label: "Option 02 - White / Pink Round Winged Star",
        image: "/tools/assets/catalog/curated-20260801/english/723282936906/white-pink-round-winged-star.webp"
      },
      {
        label: "Option 03 - Pink Square Wand Star",
        image: "/tools/assets/catalog/curated-20260801/english/723282936906/pink-square-wand-star.webp"
      },
      {
        label: "Option 04 - Gray Square Wand Star",
        image: "/tools/assets/catalog/curated-20260801/english/723282936906/gray-square-wand-star.webp"
      }
    ],
    "LZN-678366350023": [
      {
        label: "Option 01 - Gray Tray",
        image: "/tools/assets/catalog/curated-20260801/english/678366350023/gray-tray.webp"
      },
      {
        label: "Option 02 - Green Tray",
        image: "/tools/assets/catalog/curated-20260801/english/678366350023/green-tray.webp"
      },
      {
        label: "Option 03 - Yellow Tray",
        image: "/tools/assets/catalog/curated-20260801/english/678366350023/yellow-tray.webp"
      },
      {
        label: "Option 04 - Gray Tray + Empty 250 mL Bottle",
        image: "/tools/assets/catalog/curated-20260801/english/678366350023/gray-tray-empty-bottle.webp"
      },
      {
        label: "Option 05 - Green Tray + Empty 250 mL Bottle",
        image: "/tools/assets/catalog/curated-20260801/english/678366350023/green-tray-empty-bottle.webp"
      },
      {
        label: "Option 06 - Yellow Tray + Empty 250 mL Bottle",
        image: "/tools/assets/catalog/curated-20260801/english/678366350023/yellow-tray-empty-bottle.webp"
      },
      {
        label: "Option 07 - White Tray",
        image: "/tools/assets/catalog/curated-20260801/english/678366350023/white-tray.webp"
      },
      {
        label: "Option 08 - White Tray + Empty 250 mL Bottle",
        image: "/tools/assets/catalog/curated-20260801/english/678366350023/white-tray-empty-bottle.webp"
      }
    ],
    "LZN-658527917520": [
      {
        label: "Option 01 - Clear, 250 mL",
        image: "/tools/assets/catalog/curated-20260801/english/658527917520/clear-250ml.webp"
      },
      {
        label: "Option 02 - Clear, 500 mL",
        image: "/tools/assets/catalog/curated-20260801/english/658527917520/clear-500ml.webp"
      },
      {
        label: "Option 03 - Blue, 250 mL",
        image: "/tools/assets/catalog/curated-20260801/english/658527917520/blue-250ml.webp"
      },
      {
        label: "Option 04 - Pink, 250 mL",
        image: "/tools/assets/catalog/curated-20260801/english/658527917520/pink-250ml.webp"
      }
    ],
    "LZN-634199062731": [
      {
        label: "Option 01 - Temple Arms + Screwdriver and Screws",
        image: "/tools/assets/catalog/curated-20260801/english/634199062731/temple-arms-screwdriver-screws.webp"
      },
      {
        label: "Option 02 - Temple Arms + Screwdriver, Screws, and File",
        image: "/tools/assets/catalog/curated-20260801/english/634199062731/temple-arms-screwdriver-screws-file.webp"
      }
    ],
    "LZN-585323017499": [
      {
        label: "Option 01 - Black Fabric",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/black-fabric.webp"
      },
      {
        label: "Option 02 - Green Camouflage",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/green-camouflage.webp"
      },
      {
        label: "Option 03 - Silver Pink",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/silver-pink.webp"
      },
      {
        label: "Option 04 - Silver Red",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/silver-red.webp"
      },
      {
        label: "Option 05 - Silver Gray",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/silver-gray.webp"
      },
      {
        label: "Option 06 - Silver Brown",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/silver-brown.webp"
      },
      {
        label: "Option 07 - Hot Pink",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/hot-pink.webp"
      },
      {
        label: "Option 08 - Woven Black",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/woven-black.webp"
      },
      {
        label: "Option 09 - Smooth Black",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/smooth-black.webp"
      },
      {
        label: "Option 10 - Yellow",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/yellow.webp"
      },
      {
        label: "Option 11 - Deep Blue",
        image: "/tools/assets/catalog/curated-20260801/english/585323017499/deep-blue.webp"
      }
    ],
    "LZN-691330957794": [
      {
        label: "Option 01 - Natural Wood",
        image: "/tools/assets/catalog/curated-20260801/english/691330957794/natural-wood.webp"
      }
    ],
    "LZN-612244347689": [
      {
        label: "Option 01 - Pearl White",
        image: "/tools/assets/catalog/curated-20260801/english/612244347689/pearl-white.webp"
      },
      {
        label: "Option 02 - Piano Black",
        image: "/tools/assets/catalog/curated-20260801/english/612244347689/piano-black.webp"
      },
      {
        label: "Option 03 - Cherry Blossom Pink",
        image: "/tools/assets/catalog/curated-20260801/english/612244347689/cherry-blossom-pink.webp"
      },
      {
        label: "Option 04 - Sky Blue",
        image: "/tools/assets/catalog/curated-20260801/english/612244347689/sky-blue.webp"
      }
    ],
    "LZN-739604309325": [
      {
        label: "Option 01 - Black",
        image: "/tools/assets/catalog/curated-20260730/english/739604309325/black.webp"
      },
      {
        label: "Option 02 - Taupe",
        image: "/tools/assets/catalog/curated-20260730/english/739604309325/taupe.webp"
      },
      {
        label: "Option 03 - Light Gray",
        image: "/tools/assets/catalog/curated-20260730/english/739604309325/light-gray.webp"
      },
      {
        label: "Option 04 - Brown",
        image: "/tools/assets/catalog/curated-20260730/english/739604309325/brown.webp"
      }
    ],
    "LZN-675965294746": [
      {
        label: "Option 01 - Light Pink / Dark Pink, 1 Pair",
        image: "/tools/assets/catalog/curated-20260801/english/675965294746/light-pink-dark-pink.webp"
      },
      {
        label: "Option 02 - Light Purple / Black, 1 Pair",
        image: "/tools/assets/catalog/curated-20260801/english/675965294746/light-purple-black.webp"
      },
      {
        label: "Option 03 - Light Purple / Dark Purple, 1 Pair",
        image: "/tools/assets/catalog/curated-20260801/english/675965294746/light-purple-dark-purple.webp"
      }
    ],
    "LZN-625178269004": [
      {
        label: "Option 01 - Gloss Black Temple Arms",
        image: "/tools/assets/catalog/curated-20260801/english/625178269004/temple-arms-standard.webp"
      },
      {
        label: "Option 02 - Temple Arms + 3 Pairs Ear Hooks",
        image: "/tools/assets/catalog/curated-20260801/english/625178269004/temple-arms-ear-hooks.webp"
      },
      {
        label: "Option 03 - Temple Arms + 3 Pairs Nose Pads",
        image: "/tools/assets/catalog/curated-20260801/english/625178269004/temple-arms-nose-pads.webp"
      }
    ],
    "LZN-607829059398": [
      {
        label: "Option 01 - Light Pink / Red Stitch",
        image: "/tools/assets/catalog/curated-20260801/english/607829059398/light-pink-red-stitch.webp"
      },
      {
        label: "Option 02 - Magenta / White Stitch",
        image: "/tools/assets/catalog/curated-20260801/english/607829059398/magenta-white-stitch.webp"
      },
      {
        label: "Option 03 - Yellow / Red Stitch",
        image: "/tools/assets/catalog/curated-20260801/english/607829059398/yellow-red-stitch.webp"
      },
      {
        label: "Option 04 - Blue / White Stitch",
        image: "/tools/assets/catalog/curated-20260801/english/607829059398/blue-white-stitch.webp"
      },
      {
        label: "Option 05 - Light Gray / Red Stitch",
        image: "/tools/assets/catalog/curated-20260801/english/607829059398/light-gray-red-stitch.webp"
      },
      {
        label: "Option 06 - Light Gray / Yellow Stitch",
        image: "/tools/assets/catalog/curated-20260801/english/607829059398/light-gray-yellow-stitch.webp"
      },
      {
        label: "Option 07 - Dark Gray / Yellow Stitch",
        image: "/tools/assets/catalog/curated-20260801/english/607829059398/dark-gray-yellow-stitch.webp"
      },
      {
        label: "Option 08 - Purple / White Stitch",
        image: "/tools/assets/catalog/curated-20260801/english/607829059398/purple-white-stitch.webp"
      }
    ],
    "LZN-592494388948": [
      {
        label: "Option 01 - White Geometric Triangle",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/002.webp"
      },
      {
        label: "Option 02 - Pink Journey Triangle",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/001.webp"
      },
      {
        label: "Option 03 - Blue / White Square",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/004.webp"
      },
      {
        label: "Option 04 - Green / White Square",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/005.webp"
      },
      {
        label: "Option 05 - Black / White Square",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/007.webp"
      },
      {
        label: "Option 06 - Pink / White Square",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/003.webp"
      },
      {
        label: "Option 07 - Brown Small Case",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/010.webp"
      },
      {
        label: "Option 08 - White Eagle Print",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/011.webp"
      },
      {
        label: "Option 09 - Pink Small Case",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/008.webp"
      },
      {
        label: "Option 10 - Black Small Case",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/009.webp"
      },
      {
        label: "Option 11 - Brown / White Square",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/006.webp"
      },
      {
        label: "Option 12 - Red Mosaic Print",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/012.webp"
      },
      {
        label: "Option 13 - Multicolor Mosaic Print",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/013.webp"
      },
      {
        label: "Option 14 - Green Owl Print",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/014.webp"
      },
      {
        label: "Option 15 - Blue Graphic Print",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/015.webp"
      },
      {
        label: "Option 16 - White Botanical Print",
        image: "/tools/assets/catalog/curated-20260729/original-cn/592494388948/016.webp"
      }
    ],
    "LZN-598559007116": [
      {
        label: "Option 01 - White Deer Constellation Set",
        image: "/tools/assets/catalog/curated-20260729/original-cn/598559007116/001.webp"
      },
      {
        label: "Option 02 - Pink Lily Set",
        image: "/tools/assets/catalog/curated-20260729/original-cn/598559007116/002.webp"
      },
      {
        label: "Option 03 - Turquoise Cherry Blossom Set",
        image: "/tools/assets/catalog/curated-20260729/original-cn/598559007116/003.webp"
      },
      {
        label: "Option 04 - Pink Polar Bear Set",
        image: "/tools/assets/catalog/curated-20260729/original-cn/598559007116/004.webp"
      },
      {
        label: "Option 05 - Blue Floral Portrait Set",
        image: "/tools/assets/catalog/curated-20260729/original-cn/598559007116/005.webp"
      },
      {
        label: "Option 06 - Pink Flamingo Set",
        image: "/tools/assets/catalog/curated-20260729/original-cn/598559007116/006.webp"
      }
    ],
    "LZN-635408516585": [
      {
        label: "Option 01 - Blue Elephant",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/002.webp"
      },
      {
        label: "Option 02 - Pink Cat Hi",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/006.webp"
      },
      {
        label: "Option 03 - Pink Bear Wow",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/007.webp"
      },
      {
        label: "Option 04 - Blue Koala OK",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/008.webp"
      },
      {
        label: "Option 05 - Blue Dinosaur Oh",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/009.webp"
      },
      {
        label: "Option 06 - Green Crocodile Well",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/010.webp"
      },
      {
        label: "Option 07 - Green Duck Nice",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/011.webp"
      },
      {
        label: "Option 08 - Pink Bear",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/012.webp"
      },
      {
        label: "Option 09 - Purple Rabbit",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/015.webp"
      },
      {
        label: "Option 10 - Pink Bear / Blue Dinosaur",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/025.webp"
      },
      {
        label: "Option 11 - Pink Bear / Beige Alpaca",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/026.webp"
      },
      {
        label: "Option 12 - Pink Bear / Blue Koala",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/027.webp"
      },
      {
        label: "Option 13 - Green Duck / Green Crocodile",
        image: "/tools/assets/catalog/curated-20260729/original-cn/635408516585/034.webp"
      }
    ],
    "LZN-777094994614": [
      {
        label: "Option 01 - Orange - 1 Strap",
        image: "/tools/assets/catalog/curated-20260729/original-cn/777094994614/001.webp"
      },
      {
        label: "Option 02 - Orange - 2 Straps",
        image: "/tools/assets/catalog/curated-20260729/original-cn/777094994614/002.webp"
      },
      {
        label: "Option 03 - Pink - 1 Strap",
        image: "/tools/assets/catalog/curated-20260729/original-cn/777094994614/003.webp"
      },
      {
        label: "Option 04 - Pink - 2 Straps",
        image: "/tools/assets/catalog/curated-20260729/original-cn/777094994614/004.webp"
      },
      {
        label: "Option 05 - Black - 1 Strap",
        image: "/tools/assets/catalog/curated-20260729/original-cn/777094994614/005.webp"
      },
      {
        label: "Option 06 - Black - 2 Straps",
        image: "/tools/assets/catalog/curated-20260729/original-cn/777094994614/006.webp"
      },
      {
        label: "Option 07 - Red - 1 Strap",
        image: "/tools/assets/catalog/curated-20260729/original-cn/777094994614/007.webp"
      },
      {
        label: "Option 08 - Red - 2 Straps",
        image: "/tools/assets/catalog/curated-20260729/original-cn/777094994614/008.webp"
      },
      {
        label: "Option 09 - Assorted Colors - 3 Straps",
        image: "/tools/assets/catalog/curated-20260729/original-cn/777094994614/009.webp"
      }
    ],
    "LZN-605818164392": [
      {
        label: "Option 01 - A6 Round-Hole Alloy Sleeves - 2 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/002.webp"
      },
      {
        label: "Option 02 - A6 Round-Hole Alloy Sleeves - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/003.webp"
      },
      {
        label: "Option 03 - B3 Round-Hole Alloy Sleeves - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/004.webp"
      },
      {
        label: "Option 04 - A9 Round-Hole Titanium Sleeves - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/005.webp"
      },
      {
        label: "Option 05 - B2 Round-Hole Titanium Sleeves - 2 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/006.webp"
      },
      {
        label: "Option 06 - B5 Round-Hole Alloy Sleeves - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/007.webp"
      },
      {
        label: "Option 07 - B5 Round-Hole Alloy Sleeves - 2 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/008.webp"
      },
      {
        label: "Option 08 - B1 / B2 / A8 Alloy Set - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/015.webp"
      },
      {
        label: "Option 09 - B3 Round-Hole Alloy Sleeves - 2 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/016.webp"
      },
      {
        label: "Option 10 - A8 Round-Hole Alloy Sleeves - 2 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/017.webp"
      },
      {
        label: "Option 11 - A8 Round-Hole Alloy Sleeves - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/018.webp"
      },
      {
        label: "Option 12 - A9 Round-Hole Titanium Sleeves - 2 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/019.webp"
      },
      {
        label: "Option 13 - B4 Round-Hole Alloy Sleeves - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/020.webp"
      },
      {
        label: "Option 14 - B4 Round-Hole Alloy Sleeves - 2 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/021.webp"
      },
      {
        label: "Option 15 - B2 Round-Hole Titanium Sleeves - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/022.webp"
      },
      {
        label: "Option 16 - A8 / B1 / B2 Alloy Set - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/023.webp"
      },
      {
        label: "Option 17 - A6 / A7 / A8 Alloy Set - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/024.webp"
      },
      {
        label: "Option 18 - A6 / A7 Alloy Set - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/025.webp"
      },
      {
        label: "Option 19 - A6 / A8 Alloy Set - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/026.webp"
      },
      {
        label: "Option 20 - A6 / A9 Alloy Set - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/027.webp"
      },
      {
        label: "Option 21 - A6 / B1 Alloy Set - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/605818164392/028.webp"
      }
    ],
    "LZN-717183914442": [
      {
        label: "Option 01 - TTS-09 White - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/001.webp"
      },
      {
        label: "Option 02 - TTS-09 White - 2 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/002.webp"
      },
      {
        label: "Option 03 - TTS-09 White - 4 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/003.webp"
      },
      {
        label: "Option 04 - TTS-09 Black / White - 2 Pairs Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/004.webp"
      },
      {
        label: "Option 05 - TTS-09 Brown / White - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/005.webp"
      },
      {
        label: "Option 06 - TTS-09 Black / White - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/006.webp"
      },
      {
        label: "Option 07 - TTS-09 Black / Gray - 2 Pairs Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/007.webp"
      },
      {
        label: "Option 08 - TTS-09 Black / Gray - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/008.webp"
      },
      {
        label: "Option 09 - TTS-09 Black / Brown - 2 Pairs Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/009.webp"
      },
      {
        label: "Option 10 - TTS-09 Black / Brown - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/015.webp"
      },
      {
        label: "Option 11 - TTS-09 Black - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/016.webp"
      },
      {
        label: "Option 12 - TTS-09 Black - 2 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/017.webp"
      },
      {
        label: "Option 13 - TTS-09 Black - 4 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/018.webp"
      },
      {
        label: "Option 14 - TTS-09 Black / Gray / Brown / White - 1 Pair Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/019.webp"
      },
      {
        label: "Option 15 - TTS-09 Gray / White - 2 Pairs Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/020.webp"
      },
      {
        label: "Option 16 - TTS-09 Gray - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/021.webp"
      },
      {
        label: "Option 17 - TTS-09 Gray - 2 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/022.webp"
      },
      {
        label: "Option 18 - TTS-09 Gray - 4 Pairs",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/023.webp"
      },
      {
        label: "Option 19 - TTS-09 Brown / White - 2 Pairs Each",
        image: "/tools/assets/catalog/curated-20260729/original-cn/717183914442/024.webp"
      }
    ],
    "LZN-610342838181": [
      {
        label: "Option 01 - Butterfly Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/003.webp"
      },
      {
        label: "Option 02 - Five-Bead Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/004.webp"
      },
      {
        label: "Option 03 - Snake Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/005.webp"
      },
      {
        label: "Option 04 - Snake Chain - Silver",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/006.webp"
      },
      {
        label: "Option 05 - Small Wave Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/007.webp"
      },
      {
        label: "Option 06 - Lantern Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/008.webp"
      },
      {
        label: "Option 07 - Star Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/009.webp"
      },
      {
        label: "Option 08 - Handmade Star Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/010.webp"
      },
      {
        label: "Option 09 - Small Two-Bead Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/011.webp"
      },
      {
        label: "Option 10 - Small Two-Bead Chain - Silver",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/016.webp"
      },
      {
        label: "Option 11 - Multicolor Gem Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/017.webp"
      },
      {
        label: "Option 12 - Multicolor Gem Chain - Silver",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/018.webp"
      },
      {
        label: "Option 13 - D Charm Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/019.webp"
      },
      {
        label: "Option 14 - D Charm Chain - Silver",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/020.webp"
      },
      {
        label: "Option 15 - Large Two-Bead Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/021.webp"
      },
      {
        label: "Option 16 - Large Two-Bead Chain - Silver",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/022.webp"
      },
      {
        label: "Option 17 - Round Ring Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/023.webp"
      },
      {
        label: "Option 18 - Round Ring Chain - Silver",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/024.webp"
      },
      {
        label: "Option 19 - Double-Ring Charm Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/025.webp"
      },
      {
        label: "Option 20 - Double-Ring Charm Chain - Silver",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/026.webp"
      },
      {
        label: "Option 21 - Five-Star Chain - Silver",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/027.webp"
      },
      {
        label: "Option 22 - Pendant Ring Chain - Gold",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/028.webp"
      },
      {
        label: "Option 23 - Heart Charm Chain - Silver",
        image: "/tools/assets/catalog/curated-20260729/original-cn/610342838181/029.webp"
      }
    ],
    "LZN-694016088201": [
      {
        label: "Option 01 - Champagne Gold Glitter",
        image: "/tools/assets/catalog/curated-20260801/english/694016088201/champagne-gold-glitter.webp"
      },
      {
        label: "Option 02 - Silver Glitter",
        image: "/tools/assets/catalog/curated-20260801/english/694016088201/silver-glitter.webp"
      }
    ],
    "LZN-696035777060": [
      {
        label: "Option 01 - 5 mm Matte Black - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/002.webp"
      },
      {
        label: "Option 02 - 5 mm Clear - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/003.webp"
      },
      {
        label: "Option 03 - 5 mm Glossy Black - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/004.webp"
      },
      {
        label: "Option 04 - 6 mm Matte Black - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/012.webp"
      },
      {
        label: "Option 05 - 6 mm Clear - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/013.webp"
      },
      {
        label: "Option 06 - 6 mm Glossy Black - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/014.webp"
      },
      {
        label: "Option 07 - 6.5 mm Matte Black - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/018.webp"
      },
      {
        label: "Option 08 - 6.5 mm Clear - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/019.webp"
      },
      {
        label: "Option 09 - 6.5 mm Glossy Black - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/020.webp"
      },
      {
        label: "Option 10 - 7 mm Matte Black - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/024.webp"
      },
      {
        label: "Option 11 - 7 mm Clear - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/025.webp"
      },
      {
        label: "Option 12 - 7 mm Glossy Black - 1 Pair",
        image: "/tools/assets/catalog/curated-20260729/original-cn/696035777060/026.webp"
      }
    ],
    "LZN-594962368226": [
      {
        label: "Option 01 - Red Pen-Style Case",
        image: "/tools/assets/catalog/curated-20260801/english/594962368226/red.webp"
      },
      {
        label: "Option 02 - Yellow Pen-Style Case",
        image: "/tools/assets/catalog/curated-20260801/english/594962368226/yellow.webp"
      },
      {
        label: "Option 03 - Gray Pen-Style Case",
        image: "/tools/assets/catalog/curated-20260801/english/594962368226/gray.webp"
      },
      {
        label: "Option 04 - Blue Pen-Style Case",
        image: "/tools/assets/catalog/curated-20260801/english/594962368226/blue.webp"
      },
      {
        label: "Option 05 - Silver Gray Pen-Style Case",
        image: "/tools/assets/catalog/curated-20260801/english/594962368226/silver-gray.webp"
      }
    ],
    "LZN-739604037804": [
      {
        label: "Option 01 - 1-Pair Set",
        image: "/tools/assets/catalog/curated-20260801/english/739604037804/one-pair-set.webp"
      },
      {
        label: "Option 02 - 3-Pair Set",
        image: "/tools/assets/catalog/curated-20260801/english/739604037804/three-pair-set.webp"
      },
      {
        label: "Option 03 - 5-Pair Set",
        image: "/tools/assets/catalog/curated-20260801/english/739604037804/five-pair-set.webp"
      },
      {
        label: "Option 04 - 7-Pair Set",
        image: "/tools/assets/catalog/curated-20260801/english/739604037804/seven-pair-set.webp"
      }
    ],
    "LZN-669731145847": [
      {
        label: "Option 01 - Screen and Lens Polishing Cloth",
        image: "/tools/assets/catalog/curated-20260801/english/669731145847/polishing-cloth.webp"
      }
    ],
    "LZN-763152459242": [
      {
        label: "Option 01 - White",
        image: "/tools/assets/catalog/curated-20260801/english/763152459242/white.webp"
      },
      {
        label: "Option 02 - Pink",
        image: "/tools/assets/catalog/curated-20260801/english/763152459242/pink.webp"
      },
      {
        label: "Option 03 - Yellow",
        image: "/tools/assets/catalog/curated-20260801/english/763152459242/yellow.webp"
      }
    ],
    "LZN-617968191574": [
      {
        label: "Option 01 - Red / +1.00 D",
        image: "/tools/assets/catalog/curated-20260729/original-cn/617968191574/002.webp"
      },
      {
        label: "Option 02 - Red / +1.50 D",
        image: "/tools/assets/catalog/curated-20260729/original-cn/617968191574/003.webp"
      },
      {
        label: "Option 03 - Red / +2.00 D",
        image: "/tools/assets/catalog/curated-20260729/original-cn/617968191574/004.webp"
      },
      {
        label: "Option 04 - Red / +2.50 D",
        image: "/tools/assets/catalog/curated-20260729/original-cn/617968191574/005.webp"
      },
      {
        label: "Option 05 - Red / +3.00 D",
        image: "/tools/assets/catalog/curated-20260729/original-cn/617968191574/006.webp"
      },
      {
        label: "Option 06 - Red / +3.50 D",
        image: "/tools/assets/catalog/curated-20260729/original-cn/617968191574/007.webp"
      },
      {
        label: "Option 07 - Red / +4.00 D",
        image: "/tools/assets/catalog/curated-20260729/original-cn/617968191574/008.webp"
      },
      {
        label: "Option 08 - Gold / +1.00 D",
        image: "/tools/assets/catalog/curated-20260729/original-cn/617968191574/009.webp"
      },
      {
        label: "Option 09 - Gold / +1.50 D",
        image: "/tools/assets/catalog/curated-20260729/original-cn/617968191574/010.webp"
      },
      {
        label: "Option 10 - Gold / +2.00 D",
        image: "/tools/assets/catalog/curated-20260729/original-cn/617968191574/011.webp"
      }
    ],
    "LZN-602357189850": [
      {
        label: "Option 01 - White",
        image: "/tools/assets/catalog/curated-20260801/english/602357189850/white.webp"
      },
      {
        label: "Option 02 - Orange",
        image: "/tools/assets/catalog/curated-20260801/english/602357189850/orange.webp"
      },
      {
        label: "Option 03 - Red",
        image: "/tools/assets/catalog/curated-20260801/english/602357189850/red.webp"
      },
      {
        label: "Option 04 - Green",
        image: "/tools/assets/catalog/curated-20260801/english/602357189850/green.webp"
      },
      {
        label: "Option 05 - Purple",
        image: "/tools/assets/catalog/curated-20260801/english/602357189850/purple.webp"
      },
      {
        label: "Option 06 - Brown",
        image: "/tools/assets/catalog/curated-20260801/english/602357189850/brown.webp"
      },
      {
        label: "Option 07 - Pink",
        image: "/tools/assets/catalog/curated-20260801/english/602357189850/pink.webp"
      }
    ],
    "LZN-691677973956": [
      {
        label: "Option 01 - Frosted Square Case",
        image: "/tools/assets/catalog/curated-20260801/english/691677973956/frosted-square-case.webp"
      },
      {
        label: "Option 02 - Frosted Oval Case",
        image: "/tools/assets/catalog/curated-20260801/english/691677973956/frosted-oval-case.webp"
      }
    ],
    "LZN-642715432999": [
      {
        label: "Option 01 - Lacquered Black",
        image: "/tools/assets/catalog/curated-20260801/english/642715432999/lacquered-black.webp"
      },
      {
        label: "Option 02 - Black",
        image: "/tools/assets/catalog/curated-20260801/english/642715432999/black.webp"
      },
      {
        label: "Option 03 - Beige",
        image: "/tools/assets/catalog/curated-20260801/english/642715432999/beige.webp"
      },
      {
        label: "Option 04 - Solid Blue",
        image: "/tools/assets/catalog/curated-20260801/english/642715432999/solid-blue.webp"
      },
      {
        label: "Option 05 - Clear",
        image: "/tools/assets/catalog/curated-20260801/english/642715432999/clear.webp"
      },
      {
        label: "Option 06 - Transparent Pink",
        image: "/tools/assets/catalog/curated-20260801/english/642715432999/transparent-pink.webp"
      }
    ]
  };

  var toolProductCurations = {
    "LZN-594962368226": {
      nameEn: "Pen-Style Eyeglass Case",
      chineseName: "Pen-Style Eyeglass Case",
      description: "Compact pen-style eyeglass cases for storing slim reading glasses or optical frames."
    }
  };

  var missingOptionImageCurations = {
    "3T-1456": [
      "assets/3tmall/cloth-single-01.webp",
      "assets/3tmall/cloth-single-08.webp",
      "assets/3tmall/cloth-single-09.webp",
      "assets/3tmall/cloth-single-05.webp",
      "assets/3tmall/cloth-single-01.webp",
      "assets/3tmall/cloth-single-01.webp",
      "assets/3tmall/cloth-single-01.webp",
      "assets/3tmall/cloth-single-10.webp",
      "assets/3tmall/cloth-single-07.webp",
      "assets/3tmall/cloth-single-06.webp"
    ],
    "3T-1458": [
      "assets/3tmall/cloth-double-09.webp",
      "assets/3tmall/cloth-double-06.webp",
      "assets/3tmall/cloth-double-08.webp",
      "assets/3tmall/cloth-double-05.webp",
      "assets/3tmall/cloth-double-07.webp",
      "assets/3tmall/cloth-double-09.webp",
      "assets/3tmall/cloth-double-10.webp",
      "assets/3tmall/cloth-double-08.webp",
      "assets/3tmall/cloth-double-01.webp",
      "assets/3tmall/cloth-double-07.webp"
    ],
    "LZN-TL-0038": [
      "assets/catalog/curated-20260730/english/TL-0038/titanium-gunmetal-1-pair.webp",
      "assets/catalog/curated-20260730/english/TL-0038/titanium-black-1-pair.webp",
      "assets/catalog/curated-20260730/english/TL-0038/ceramic-rose-gold-1-pair.webp",
      "assets/catalog/curated-20260730/english/TL-0038/ceramic-gold-1-pair.webp",
      "assets/catalog/curated-20260730/english/TL-0038/silicone-air-cushion-2-pairs.webp"
    ],
    "LZN-TL-0039": [
      "assets/catalog/curated-20260730/english/TL-0039/matte-white.webp",
      "assets/catalog/curated-20260730/english/TL-0039/matte-black.webp",
      "assets/catalog/curated-20260730/english/TL-0039/dark-blue.webp",
      "assets/catalog/curated-20260730/english/TL-0039/light-pink.webp",
      "assets/catalog/curated-20260730/english/TL-0039/light-blue.webp"
    ]
  };

  var replaceGalleryFromOptionImages = {
    "LZN-TL-0038": true,
    "LZN-TL-0039": true
  };

  function restoreChineseOriginals(items, field) {
    (items || []).forEach(function (item) {
      var list = originalCnCurations[legacyModel(item)] ||
        originalCnCurations[String(item && item.model || "")];
      if (!list || !list.length) return;
      var options = item[field] || [];
      var curatedOptions = toolOptionCurations[legacyModel(item)] ||
        toolOptionCurations[String(item && item.model || "")];
      if (curatedOptions && curatedOptions.length < options.length) {
        options = options.slice(0, curatedOptions.length);
        item[field] = options;
      }
      options.forEach(function (option, index) {
        var curated = curatedOptions && curatedOptions[index];
        var image = curated
          ? curated.image
          : list[Math.min(index, list.length - 1)];
        option.image = image;
        if (curated && curated.label) option.label = curated.label;
        if (field === "colors") option.src = image;
      });
      var gallery = curatedOptions
        ? curatedOptions.map(function (option) { return option.image; })
        : list;
      item.image = gallery[0];
      item.title = gallery[0];
      item.images = Array.from(new Set(gallery));
    });
  }

  function restoreMissingOptionImages(items) {
    (items || []).forEach(function (item) {
      var list = missingOptionImageCurations[String(item && item.model || "")];
      if (!list || !list.length) return;
      (item.options || []).forEach(function (option, index) {
        if (list[index]) option.image = list[index];
      });
      if (replaceGalleryFromOptionImages[String(item && item.model || "")]) {
        item.image = list[0];
        item.title = list[0];
        item.images = Array.from(new Set(list));
      } else {
        item.images = Array.from(new Set([
          item.image,
          ...(item.images || []),
          ...list
        ].filter(Boolean)));
      }
    });
  }

  var toolsCatalog = typeof CATALOG_DATA !== "undefined"
    ? CATALOG_DATA
    : (window.CATALOG_DATA || []);
  toolsCatalog.forEach(function (category) {
    (category.items || []).forEach(function (item) {
      var productCuration = toolProductCurations[legacyModel(item)] ||
        toolProductCurations[String(item && item.model || "")];
      if (!productCuration) return;
      Object.keys(productCuration).forEach(function (key) {
        item[key] = productCuration[key];
      });
    });
    cleanOptions(category.items || [], "options");
    restoreChineseOriginals(category.items || [], "options");
    restoreMissingOptionImages(category.items || []);
  });

  var frameSeries = typeof PRODUCT_SERIES !== "undefined"
    ? PRODUCT_SERIES
    : (window.PRODUCT_SERIES || []);

  frameSeries.forEach(function (series) {
    series.items = (series.items || []).filter(function (item) {
      return legacyModel(item) !== "LZN-596588908212" &&
        legacyModel(item) !== "LZN-611760273841";
    });
    cleanOptions(series.items, "colors");
  });

  var frameCurations = {
  "LZN-584869581637": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/584869581637/001.webp"
    },
    {
      "label": "Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/584869581637/002.webp"
    },
    {
      "label": "Gunmetal",
      "image": "/tools/assets/catalog/curated-20260729/frames/584869581637/003.webp"
    },
    {
      "label": "Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/584869581637/004.webp"
    },
    {
      "label": "Black / Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/584869581637/005.webp"
    },
    {
      "label": "Black / Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/584869581637/006.webp"
    }
  ],
  "LZN-586908860585": [
    {
      "label": "Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/586908860585/002.webp"
    },
    {
      "label": "Gold",
      "image": "/tools/assets/catalog/curated-20260729/frames/586908860585/003.webp"
    },
    {
      "label": "Gunmetal",
      "image": "/tools/assets/catalog/curated-20260729/frames/586908860585/004.webp"
    },
    {
      "label": "Silver",
      "image": "/tools/assets/catalog/curated-20260729/frames/586908860585/005.webp"
    }
  ],
  "LZN-587119337526": [
    {
      "label": "Glossy Black",
      "image": "/tools/assets/catalog/curated-20260729/frames/587119337526/001.webp"
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
