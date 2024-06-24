import { Box } from "@mui/material";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import CardHeadMobile from "./CardHeadMobile";
import cardNumber from "./cardNumber";

function FileCardSlider({ ...props }) {
  let application = 0;
  let image = 0;
  let video = 0;
  let audio = 0;
  let text = 0;
  let other = 0;

  for (
    let i = 0;
    i < props?.getCount?.getFileCategoryDetails?.data?.length;
    i++
  ) {
    if (
      props.getCount.getFileCategoryDetails?.data[i]?.fileType?.split(
        "/",
      )?.[0] === "application"
    ) {
      application = props.getCount.getFileCategoryDetails?.data[i]?.size;
    } else if (
      props.getCount.getFileCategoryDetails?.data[i]?.fileType?.split(
        "/",
      )?.[0] === "image"
    ) {
      image = props.getCount.getFileCategoryDetails?.data[i]?.size;
    } else if (
      props.getCount.getFileCategoryDetails?.data[i]?.fileType?.split(
        "/",
      )?.[0] === "video"
    ) {
      video = props.getCount.getFileCategoryDetails?.data[i]?.size;
    } else if (
      props.getCount.getFileCategoryDetails?.data[i]?.fileType?.split(
        "/",
      )?.[0] === "audio"
    ) {
      audio = props.getCount.getFileCategoryDetails?.data[i]?.size;
    } else if (
      props.getCount.getFileCategoryDetails?.data[i]?.fileType?.split(
        "/",
      )?.[0] === "text"
    ) {
      text = props.getCount.getFileCategoryDetails?.data[i]?.size;
    } else if (
      props.getCount.getFileCategoryDetails?.data[i]?.fileType?.split(
        "/",
      )?.[0] === "" ||
      null
    ) {
      other = props.getCount.getFileCategoryDetails?.data[i]?.size;
    }
  }
  const obj = { application, image, video, audio, text, other };
  return (
    <div>
      <Box>
        <Swiper spaceBetween={5} slidesPerView={3}>
          {cardNumber.map((card, index) => (
            <SwiperSlide key={index}>
              <CardHeadMobile
                data={obj}
                icon={card.icon}
                title={card.title}
                type={card.type}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </div>
  );
}

export default FileCardSlider;
