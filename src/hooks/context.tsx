/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-ignore
import { InferenceSession, Tensor } from "onnxruntime-web";
import LZString from "lz-string";
import React, { useState, useEffect, useCallback } from "react";
import type { modelInputProps, modelScaleProps } from "../helpers/Interface";
import { modelData, setParmsandQueryModel } from "../helpers/modelAPI";
import {
  getAllMasks,
  keepArrayForMultiMask,
  rleToImage,
  traceCompressedRLeStringToSVG,
  traceOnnxMaskToSVG,
} from "../helpers/maskUtils";
import { handleImageScale } from "../helpers/ImageHelper";
import getFile from "../helpers/getFile";
import AppContext from "./createContext";

const AppContextProvider = (props: {
  children: React.ReactElement<any, string | React.JSXElementConstructor<any>>;
}) => {
  const [click, setClick] = useState<modelInputProps | null>(null);
  const [clicks, setClicks] = useState<Array<modelInputProps> | null>(null);
  const [clicksHistory, setClicksHistory] =
    useState<Array<modelInputProps> | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [prevImage, setPrevImage] = useState<HTMLImageElement | null>(null);
  const [isErasing, setIsErasing] = useState<boolean>(false);
  const [isErased, setIsErased] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [svg, setSVG] = useState<string[] | null>(null);
  const [svgs, setSVGs] = useState<string[][] | null>(null);
  const [allsvg, setAllsvg] = useState<
    { svg: string[]; point_coord: number[] }[] | null
  >(null);
  const [isModelLoaded, setIsModelLoaded] = useState<{
    boxModel: boolean;
    allModel: boolean;
  }>({ boxModel: false, allModel: false });
  const [stickers, setStickers] = useState<HTMLCanvasElement[]>([]);
  const [activeSticker, setActiveSticker] = useState<number>(0);
  const [segmentTypes, setSegmentTypes] = useState<"Box" | "Click" | "All">(
    "Click"
  );
  const [canvasWidth, setCanvasWidth] = useState<number>(0);
  const [canvasHeight, setCanvasHeight] = useState<number>(0);
  const [maskImg, setMaskImg] = useState<HTMLImageElement | null>(null);
  const [maskCanvas, setMaskCanvas] = useState<HTMLCanvasElement | null>(null);
  const [userNegClickBool, setUserNegClickBool] = useState<boolean>(false);
  const [hasNegClicked, setHasNegClicked] = useState<boolean>(false);
  const [stickerTabBool, setStickerTabBool] = useState<boolean>(false);
  const [enableDemo, setEnableDemo] = useState(false);
  const [isMultiMaskMode, setIsMultiMaskMode] = useState<boolean>(false);
  const [isHovering, setIsHovering] = useState<boolean | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);
  const [eraserText, setEraserText] = useState<{
    isErase: boolean;
    isEmbedding: boolean;
  }>({ isErase: false, isEmbedding: false });
  const [didShowAMGAnimation, setDidShowAMGAnimation] =
    useState<boolean>(false);
  const [predMask, setPredMask] = useState<Tensor | null>(null);
  const [predMasks, setPredMasks] = useState<Tensor[] | null>(null);
  const [predMasksHistory, setPredMasksHistory] = useState<Tensor[] | null>(
    null
  );
  const [isAllAnimationDone, setIsAllAnimationDone] = useState<boolean>(false);
  const [isToolBarUpload, setIsToolBarUpload] = useState<boolean>(false);
  const [model, setModel] = useState<InferenceSession | null>(null);
  const [multiMaskModel, setMultiMaskModel] = useState<InferenceSession | null>(
    null
  );
  const [tensor, setTensor] = useState<Tensor | null>(null);
  const [hasClicked, setHasClicked] = useState<boolean>(false);
  const [mask, setMask] = useState<
    | string[]
    | Uint8Array
    | Float32Array
    | Int8Array
    | Uint16Array
    | Int16Array
    | Int32Array
    | BigInt64Array
    | Float64Array
    | Uint32Array
    | BigUint64Array
    | null
  >(null);
  const [modelScale, setModelScale] = useState<modelScaleProps | null>(null);

  // 初始化模型
  useEffect(() => {
    const initModel = async () => {
      try {
        if (import.meta.env.VITE_MODEL_DIR === undefined) return;
        const URL: string = import.meta.env.VITE_MODEL_DIR;
        const model = await InferenceSession.create(URL);
        setModel(model);
      } catch (e) {
        console.log(e);
      }
      try {
        if (import.meta.env.VITE_MULTI_MASK_MODEL_DIR === undefined) return;
        const URL2: string = import.meta.env.VITE_MULTI_MASK_MODEL_DIR;
        const multiMaskModel = await InferenceSession.create(URL2);
        setMultiMaskModel(multiMaskModel);
      } catch (e) {
        console.log(e);
      }
    };
    initModel();
  }, []);

  const sortAndReturnIndices = (arr: Array<number>) => {
    const indices = Array.from(arr.keys());
    indices.sort((a, b) => arr[b] - arr[a]);
    return indices;
  };

  const sortByIndices = (items: any, indices: Array<number>) => {
    const result = [];
    for (let i = 0; i < indices.length; i++) {
      result.push(items[indices[i]]);
    }
    return result;
  };

  // 加载图谱模型方法
  const runModel = async () => {
    console.log("Running singleMaskModel");
    try {
      if (
        model === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null
      )
        return;
      if (stickerTabBool) return;
      const feeds = modelData({
        clicks,
        tensor,
        modelScale,
        last_pred_mask: predMask,
      });
      if (feeds === undefined) return;
      // const beforeONNX = Date.now();
      const results = await model.run(feeds);
      // const afterONNX = Date.now();
      // console.log(`ONNX took ${afterONNX - beforeONNX}ms`);
      const output = results[model.outputNames[0]];
      if (hasClicked) {
        // const beforeSVG = Date.now();
        const pred_mask = results[model.outputNames[1]];
        setPredMask(pred_mask);
        if (!predMasksHistory) {
          setPredMasks([...(predMasks || []), pred_mask]);
        }
        const svgStr = traceOnnxMaskToSVG(
          output.data,
          output.dims[1],
          output.dims[0]
        );
        setSVG(svgStr);
        setMask(output.data);
        // const afterSVG = Date.now();
        // console.log(`SVG took ${afterSVG - beforeSVG}ms`);
      } else {
        // const beforeMask = Date.now();
        setMaskImg(rleToImage(output.data, output.dims[0], output.dims[1]));
        // const afterMask = Date.now();
        // console.log(`Mask took ${afterMask - beforeMask}ms`);
      }
      setClick(null);
      setIsLoading(false);
      setIsModelLoaded((prev) => {
        return { ...prev, boxModel: true };
      });
      // console.log("boxModel is loaded");
    } catch (e) {
      // console.log(e);
    }
  };

  // 加载多蒙层模型
  const runMultiMaskModel = async () => {
    try {
      if (
        multiMaskModel === null ||
        clicks === null ||
        tensor === null ||
        modelScale === null ||
        !hasClicked // only run for clicks
      )
        return;
      if (stickerTabBool) return;
      const feeds = modelData({
        clicks,
        tensor,
        modelScale,
        last_pred_mask: null, // Only 1 click allowed, so no last predicted mask exists
      });
      if (feeds === undefined) return;
      // console.log("Running multiMaskModel");
      const results = await multiMaskModel.run(feeds);

      const output = results["output"];
      const areas = results["areas"].data;
      const uncertain_ious = results["uncertain_ious"].data;
      const ious = results["ious"].data;

      const allMasks = getAllMasks(
        output.data,
        output.dims[2], // height
        output.dims[1] // width
      ); // There are 3

      // allMasksSorted will be a list of 1-3 masks, sorted by area.
      // The best mask is selected for rendering on the collapsed canvas.
      // You can loop through allMasksSorted
      // and render each one onto a separate layer in the multi
      // mask animation
      const sorted_indices = sortAndReturnIndices(
        // @ts-ignore
        [Number(areas[1]), Number(areas[2]), Number(areas[3])]
      ); // Keep only masks indices 1, 2, 3
      sorted_indices.reverse();

      let allMasksSorted = sortByIndices(
        [allMasks[1], allMasks[2], allMasks[3]],
        sorted_indices
      ); // Keep only 3
      let allUncertainIoUSorted = sortByIndices(
        [uncertain_ious[1], uncertain_ious[2], uncertain_ious[3]],
        sorted_indices
      );
      const allOverlapIoUsSorted = sortByIndices(
        [ious[0], ious[1], ious[2]], // Only 3 of these, not 4
        sorted_indices
      );

      // Filter bad and duplicate masks
      const keepArray = keepArrayForMultiMask(
        allUncertainIoUSorted,
        allOverlapIoUsSorted
      );
      allMasksSorted = allMasksSorted.filter(
        (_obj: any, i: number) => keepArray[i]
      );
      allUncertainIoUSorted = allUncertainIoUSorted.filter(
        (_obj: any, i: number) => keepArray[i]
      );

      // Trace remaining masks
      const svgStrs = allMasksSorted.map((mask) =>
        traceOnnxMaskToSVG(mask, output.dims[2], output.dims[1])
      );

      // Reversing the masks here because the DOM stacks elements
      // from bottom to top. In other words, the first element in
      // the array will be on the bottom, and the last element will
      // be on the top.
      setSVGs(svgStrs.reverse());

      // Set the single svg to the best mask by uncertain iou.
      // This is used for display when the masks are collapsed.
      allUncertainIoUSorted = allUncertainIoUSorted.reverse();
      const bestIdx = allUncertainIoUSorted.indexOf(
        Math.max(...allUncertainIoUSorted)
      );
      setSVG(svgStrs[bestIdx]);

      // !!!!Multiple clicks are not allowed!!!
      setClick(null);
      setIsLoading(false);
      setIsModelLoaded((prev) => {
        return { ...prev, boxModel: true };
      });
      // console.log("multiMaskModel is loaded");
    } catch (e) {
      // console.log(e);
    }
  };

  useEffect(() => {
    // TODO: By default use the runModel function
    // When the multi mask mode is enabled, run runMultiMaskModel
    const runOnnx = async () => {
      if (isMultiMaskMode) {
        if (hasClicked) {
          // Only enable multi mask case, when there are clicks.
          // We don't want the hover feature for this mode
          runMultiMaskModel();
        }
      } else {
        runModel();
      }
    };
    runOnnx();
  }, [clicks, hasClicked, isMultiMaskMode]);

  const handleImage = useCallback((img: HTMLImageElement | null = null) => {
    // Reset the image, mask and clicks
    setMaskImg(null);
    setSVG(null);
    setMask(null);
    setClick(null);
    setClicks(null);
    setIsModelLoaded({ boxModel: false, allModel: false });
    setHasClicked(false);
    if (img) {
      setImage(img);
      const { height, width, uploadScale } = handleImageScale(img);
      setParmsandQueryModel({
        width,
        height,
        uploadScale,
        imgData: img,
        handleSegModelResults,
        handleAllModelResults,
        imgName: "",
        shouldDownload: false,
        shouldNotFetchAllModel: false,
      });
    }
  }, []);

  const handleSelectedImage = async (
    data: File | URL,
    options?: { shouldNotFetchAllModel?: boolean; shouldDownload?: boolean }
  ) => {
    try {
      const shouldNotFetchAllModel = options?.shouldNotFetchAllModel;
      const shouldDownload = options?.shouldDownload;
      handleResetState();
      setIsLoading(true);
      setShowLoadingModal(true);
      let imgName = "";
      if (data instanceof URL) {
        imgName = data.pathname;
      } else if (typeof data === "string") {
        imgName = new URL(data).pathname;
      }
      imgName = imgName.substring(imgName.lastIndexOf("/") + 1);

      const imgData: File = data instanceof File ? data : await getFile(data);
      const img = new Image();
      img.src = URL.createObjectURL(imgData);

      img.onload = () => {
        setIsToolBarUpload(false);
        const { height, width, scale, uploadScale } = handleImageScale(img);
        setModelScale({
          onnxScale: scale / uploadScale,
          maskWidth: width * uploadScale,
          maskHeight: height * uploadScale,
          scale: scale,
          uploadScale: uploadScale,
          width: width,
          height: height,
        });
        img.width = Math.round(width * scale);
        img.height = Math.round(height * scale);
        setImage(img);
        setPrevImage(img);
        setIsErased(false);
        setParmsandQueryModel({
          width,
          height,
          uploadScale,
          imgData: img,
          handleSegModelResults,
          handleAllModelResults,
          imgName,
          shouldDownload,
          shouldNotFetchAllModel,
        });
      };
    } catch (error) {
      console.log(error);
    }
  };

  const handleSegModelResults = ({ tensor }: { tensor: Tensor }) => {
    setTensor(tensor);
    setIsLoading(false);
    setIsErasing(false);
    setShowLoadingModal(false);
    setEraserText({ isErase: false, isEmbedding: false });
  };

  const handleAllModelResults = ({
    allJSON,
    image_height,
  }: {
    allJSON: {
      encodedMask: string;
      bbox: number[];
      score: number;
      point_coord: number[];
      uncertain_iou: number;
      area: number;
    }[];
    image_height: number;
  }) => {
    const allMaskSVG = allJSON.map(
      (el: {
        encodedMask: string;
        bbox: number[];
        score: number;
        point_coord: number[];
        uncertain_iou: number;
        area: number;
      }) => {
        const maskenc = LZString.decompressFromEncodedURIComponent(
          el.encodedMask
        );
        const svg = traceCompressedRLeStringToSVG(maskenc, image_height);
        return { svg: svg, point_coord: el.point_coord };
      }
    );
    setAllsvg(allMaskSVG);
    setIsModelLoaded((prev) => {
      return { ...prev, allModel: true };
    });
  };

  const handleResetState = useCallback(() => {
    setMaskImg(null);
    setHasClicked(false);
    setClick(null);
    setClicks(null);
    setSVG(null);
    setSVGs(null);
    setAllsvg(null);
    setTensor(null);
    setImage(null);
    setPrevImage(null);
    setPredMask(null);
    setIsErased(false);
    setShowLoadingModal(false);
    setIsModelLoaded({ boxModel: false, allModel: false });
    setSegmentTypes("Click");
    setIsLoading(false);
    setIsMultiMaskMode(false);
    setIsHovering(null);
    setPredMasks(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        click: [click, setClick],
        clicks: [clicks, setClicks],
        clicksHistory: [clicksHistory, setClicksHistory],
        image: [image, setImage],
        prevImage: [prevImage, setPrevImage],
        error: [error, setError],
        svg: [svg, setSVG],
        svgs: [svgs, setSVGs],
        allsvg: [allsvg, setAllsvg],
        stickers: [stickers, setStickers],
        activeSticker: [activeSticker, setActiveSticker],
        isModelLoaded: [isModelLoaded, setIsModelLoaded],
        segmentTypes: [segmentTypes, setSegmentTypes],
        isLoading: [isLoading, setIsLoading],
        isErasing: [isErasing, setIsErasing],
        isErased: [isErased, setIsErased],
        canvasWidth: [canvasWidth, setCanvasWidth],
        canvasHeight: [canvasHeight, setCanvasHeight],
        maskImg: [maskImg, setMaskImg],
        maskCanvas: [maskCanvas, setMaskCanvas],
        userNegClickBool: [userNegClickBool, setUserNegClickBool],
        hasNegClicked: [hasNegClicked, setHasNegClicked],
        stickerTabBool: [stickerTabBool, setStickerTabBool],
        enableDemo: [enableDemo, setEnableDemo],
        isMultiMaskMode: [isMultiMaskMode, setIsMultiMaskMode],
        isHovering: [isHovering, setIsHovering],
        showLoadingModal: [showLoadingModal, setShowLoadingModal],
        eraserText: [eraserText, setEraserText],
        didShowAMGAnimation: [didShowAMGAnimation, setDidShowAMGAnimation],
        predMask: [predMask, setPredMask],
        predMasks: [predMasks, setPredMasks],
        predMasksHistory: [predMasksHistory, setPredMasksHistory],
        isAllAnimationDone: [isAllAnimationDone, setIsAllAnimationDone],
        isToolBarUpload: [isToolBarUpload, setIsToolBarUpload],
        model: [model, setModel],
        multiMaskModel: [multiMaskModel, setMultiMaskModel],
        tensor: [tensor, setTensor],
        hasClicked: [hasClicked, setHasClicked],
        mask: [mask, setMask],
        modelScale: [modelScale, setModelScale],
        handleResetState,
        handleImage,
        handleSelectedImage,
      }}
    >
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
