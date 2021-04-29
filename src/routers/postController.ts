import express, { RequestHandler } from "express";
import Controller from "./interfaces/controller";
import Post from "../models/Post/interface";
import PostModel from "../models/Post/model";
import UserModel from "../models/User/model";
import validation from "../middlewares/validation";
import PostDto from "../models/Post/dto";
import "dotenv/config";
import { Types } from "mongoose";

class PostController implements Controller {
  public path = "/posts";
  public router = express.Router();
  private post = PostModel;
  private user = UserModel;
  private dto = PostDto;
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(this.path, validation(this.dto), this.createPost); //게시글 작성
    this.router.patch(
      `${this.path}/:postId/:userId`,
      validation(this.dto, true),
      this.updatePost
    ); //게시글 수정
    this.router.delete(`${this.path}/:postId/:userId`, this.deletePost); //게시글 삭제
    this.router.get(`${this.path}/:postId`, this.getPostById); //게시글 상세
    this.router.get(this.path, this.getAllPosts); //게시글 전체
  }

  //게시글 작성
  private createPost: RequestHandler = async (req, res, next) => {
    //const userId = res.locals.user
    const postData: Post = req.body;
    const createPost = new this.post({ ...postData });
    try {
      await createPost.save();
      res.send({ result: "success" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  //게시글 상세
  private getPostById: RequestHandler = async (req, res, next) => {
    const { postId } = req.params;
    if (!Types.ObjectId.isValid(postId))
      next(new Error("오브젝트 아이디가 아닙니다."));
    try {
      const post = await this.post.findById(postId);
      return res.send({ result: post });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  //게시글 수정
  private updatePost: RequestHandler = async (req, res, next) => {
    //const userId = res.locals.user
    const postUpdateData: Post = req.body;
    const { postId } = req.params;
    const { userId } = req.params;
    if (!Types.ObjectId.isValid(postId))
      next(new Error("오브젝트 아이디가 아닙니다"));
    try {
      //해당 유저정보와 게시글 id로 찾고, 업데이트
      const post = await this.post.findOneAndUpdate(
        {
          _id: postId,
          user: userId,
        },
        { ...postUpdateData },
        { new: true }
      );
      if (!post) next(new Error("작성하신 글이 존재하지 않습니다."));
      return res.send({ result: post });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
  //게시글 삭제
  private deletePost: RequestHandler = async (req, res, next) => {
    //const userId = res.locals.user
    const { userId } = req.params;
    const { postId } = req.params;
    if (!Types.ObjectId.isValid(postId))
      next(new Error("오브젝트 아이다가 아닙니다."));

    try {
      const post = await PostModel.findOneAndDelete().and([
        { user: userId },
        { _id: postId },
      ]);
      if (!post) next(new Error("작성하신 글이 존재하지 않습니다."));
      return res.send({ result: "success" });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };

  //게시글 전체보기
  private getAllPosts: RequestHandler = async (req, res, next) => {
    try {
      //모든 게시글 가져오기
      const posts = await this.post.find({});
      return res.send({ result: posts });
    } catch (err) {
      console.log(err);
      next(err);
    }
  };
}
export default PostController;
