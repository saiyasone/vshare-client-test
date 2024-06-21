import Audio from "assets/images/file-types/audio.svg?react";
import File from "assets/images/file-types/file.svg?react";
import Image from "assets/images/file-types/image.svg?react";
import Other from "assets/images/file-types/other.svg?react";
import Text from "assets/images/file-types/text.svg?react";
import Video from "assets/images/file-types/video.svg?react";

const cardNumber = [
  {
    id: 1,
    icon: <File />,
    des: "Document",
    title: "Document",
    type: "application",
  },
  {
    id: 2,
    icon: <Image />,
    des: "Image",
    title: "Image",
    type: "image",
  },
  {
    id: 3,
    icon: <Video />,
    des: "Video",
    type: "video",
    title: "Video",
  },
  {
    id: 4,
    icon: <Audio />,
    des: "Audio",
    type: "audio",
    title: "Audio",
  },
  {
    id: 5,
    icon: <Text />,
    des: "Text",
    title: "Text",
    type: "text",
  },
  {
    id: 6,
    icon: <Other />,
    des: "Other",
    title: "Other",
    type: "other",
  },
];
export default cardNumber;
