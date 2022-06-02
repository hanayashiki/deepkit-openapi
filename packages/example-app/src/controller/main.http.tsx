import {
  http,
  HttpBody,
  HttpBodyValidation,
  HttpQueries,
  HttpQuery,
  HttpResponse,
  UploadedFile,
} from "@deepkit/http";
import { LoggerInterface } from "@deepkit/logger";
import { OpenAPIService } from "deepkit-openapi";
import { stringify } from "yaml";
import { SQLiteDatabase, User } from "../database";

class AddUserDto extends User {}

class UserNameOnly {
  username: string = '';
}

class UploadedFiles {
  files!: UploadedFile | UploadedFile[];
}

class ExampleError extends Error {
  code: number = 0;
}

@http.controller()
export class MainController {
  constructor(
    protected logger: LoggerInterface,
    protected database: SQLiteDatabase,
    protected openApi: OpenAPIService,
  ) {}

  @http.GET("/openapi.json")
  getOpenApi(response: HttpResponse): string {
    const s = JSON.stringify(this.openApi.serialize(), undefined, 2);
    response.setHeader("content-type", "application.json");
    response.end(s);

    return s;
  }

  @http.GET("/openapi.yaml")
  getOpenApiYaml(response: HttpResponse): string {
    const s = stringify(this.openApi.serialize(), { aliasDuplicateObjects: false });
    response.setHeader("content-type", "text/yaml");
    response.end(s);

    return s;
  }

  // @http.GET("/").name("startPage").description("List all users")
  // async startPage() {
  //   return <UserList />;
  // }

  // @http.GET("/api/users")
  // async users(): Promise<User[]> {
  //   return await this.database.query(User).find();
  // }

  @http.GET("/api/user/:id")
  async user(id: number): Promise<User> {
    return await this.database.query(User).filter({ id }).findOne();
  }

  @http.GET("/api/user/sync/:id")
  userSync(id: number): User {
    return new User("alice");
  }

  // @http.DELETE("/api/user/:id")
  // async deleteUser(id: number) {
  //   const res = await this.database.query(User).filter({ id }).deleteOne();
  //   return res.modified === 1;
  // }

  // @http.GET("/benchmark")
  // benchmark() {
  //   return "hi";
  // }

  // @http.GET("/image/:id")
  // async userImage(id: number, response: HttpResponse) {
  //   const user = await this.database.query(User).filter({ id }).findOne();
  //   if (!user.image) {
  //     return new HtmlResponse("Not found", 404);
  //   }
  //   return response.end(user.image);
  // }

  @http.POST("/add").description("Adds a new user")
  async add(body: HttpBodyValidation<AddUserDto>) {
    return body;
  }

  @http.POST("/upload").description("Uploaded files")
  async upload(body: HttpBody<UploadedFiles>) {
    return body;
  }

  @http.GET("/query")
  async queryParam(
    shit: HttpQuery<string>,
    peter: HttpQuery<string> = "peter",
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
    queries: HttpQueries<{ limit: number; offset: number }>,
  ) {
    return shit;
  }

  @http.GET("/twoQueries")
  async twoQueries(
    q1: HttpQueries<{ a: number; b: string }>,
    q2: HttpQueries<{ a: string }>,
  ) {
    return typeof q1.a;
  }

  @http.GET('/withResponse').response(200, 'Only name is showed', UserNameOnly)
  async withResponse() {
    return new User('With Response');
  }
}
