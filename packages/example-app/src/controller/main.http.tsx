import {
  http,
  HttpBody,
  HttpBodyValidation,
  HttpQueries,
  HttpQuery,
  UploadedFile,
} from "@deepkit/http";
import { LoggerInterface } from "@deepkit/logger";
import { OpenAPIService } from "deepkit-openapi";

enum Country {
  china = "cn",
  japan = "jp",
  india = "in",
}

type UserStatus = "active" | "inactive";

class User {
  country: Country = Country.india;
  status: UserStatus = "active";
  name: string = "";
}

class AddUserDto extends User {}

class UserNameOnly {
  username: string = "";
}

class UploadedFiles {
  files!: UploadedFile | UploadedFile[];
}

class ArrayInputItem {
  name: string = "";
  age: number = 0;
}

@http.controller()
export class MainController {
  constructor(
    protected logger: LoggerInterface,
    protected openApi: OpenAPIService
  ) {}

  @http.POST("/add").description("Adds a new user")
  async add(body: HttpBodyValidation<AddUserDto>) {
    return body;
  }

  @http.POST("/upload").description("Uploaded files")
  async upload(body: HttpBody<UploadedFiles>) {
    return body;
  }

  @http.POST("/api/array-input")
  async arrayInput(body: HttpBody<ArrayInputItem[]>) {
    return body;
  }

  @http.GET("/query")
  async queryParam(
    shit: HttpQuery<string>,
    peter: HttpQuery<string> = "peter"
  ) {
    return peter;
  }

  @http.GET("/omit")
  async omit(shit?: HttpQuery<number>) {
    return shit;
  }

  @http.GET("/queryWithQueries")
  async queryWithQueries(
    shit: HttpQuery<number>,
    queries: HttpQueries<{ limit: number; offset: number }>
  ) {
    return shit;
  }

  @http.GET("/twoQueries")
  async twoQueries(
    q1: HttpQueries<{ a: number; b: string }>,
    q2: HttpQueries<{ a: string }>
  ) {
    return typeof q1.a;
  }

  @http.GET("/withResponse").response(200, "Only name is showed", UserNameOnly)
  async withResponse() {
    return new User();
  }
}
