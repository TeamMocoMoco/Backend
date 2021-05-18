import { Room, RoomModel } from "../../models/Room";
import { Post, PostModel } from "../../models/Post";
import { Chat, ChatModel } from "../../models/Chat";
import { userInfo } from "../../routers/config";

class RoomService {
  private roomModel = RoomModel;
  private postModel = PostModel;
  private chatModel = ChatModel;
  constructor() {}

  createRoom = async (roomData: Room, userId: string): Promise<string> => {
    //유효한 postId인지 검사하기
    const post = await this.postModel.findOne({
      _id: roomData.post,
      user: roomData.admin,
    });
    if (!post) throw new Error("잘못된 정보가 기재되었습니다.");

    // 자신의 게시물에는 채팅방X
    if (roomData.admin === userId)
      throw new Error("자신의 게시물에는 채팅이 불가능합니다.");

    //이미 채팅방이 생성된 경우
    const room = await this.roomModel.findOne({
      admin: roomData.admin,
      participant: userId,
      post: roomData.post,
    });
    if (room) return room._id;

    //새롭게 채팅방 생성하는 경우
    const newRoom = new this.roomModel({
      post: roomData.post,
      admin: roomData.admin,
      participant: userId,
    });
    await newRoom.save();
    return newRoom._id;
  };

  getRooms = async (userId: string): Promise<Room[]> => {
    const rooms = await this.roomModel
      .find({
        $or: [{ admin: userId }, { participant: userId }],
      })
      .populate("participant", userInfo)
      .populate("admin", userInfo)
      .populate("lastChat");
    return rooms;
  };

  getRoomsLastChat = async (rooms: Room[]): Promise<(Chat | Object)[]> => {
    let lastChat: (Chat | Object)[] = [];
    const chats = await this.chatModel.find({}).sort("-createdAt");

    for (let i = 0; i < rooms.length; i++) {
      let flag = 0;
      for (let j = 0; j < chats.length; j++) {
        typeof rooms;
        if (rooms[i]._id == chats[j].roomId) {
          lastChat.push(chats[j]);
          flag = 1;
          break;
        }
      }
      if (flag === 0) {
        lastChat.push({});
      }
    }
    return lastChat;
  };

  getRoomById = async (roomId: string): Promise<Room | null> => {
    const room = await this.roomModel
      .findById(roomId)
      .populate("participant", userInfo)
      .populate("admin", userInfo)
      .populate("post", "title");
    return room;
  };

  getParticipants = async (roomInfo: Room): Promise<Post | null> => {
    const post = await this.postModel
      .findById(roomInfo.post)
      .populate("participants", userInfo)
      .select("participants");
    return post;
  };
}

export default RoomService;
