<template>
  <div class="mod-user">
    <div class="mod-user">
      <el-form :model="query" :inline="true" @keyup.enter.native="getSubjectList()">
        <el-form-item>
          <el-select
            @change="changeSchoolTypeForQuery"
            v-model="query.schoolType"
            filterable
            clearable
            placeholder="请选择所属阶段">
            <el-option
              v-for="item in schoolTypeList"
              :key="item.id"
              :label="item.value"
              :value="item.code">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-select
            v-model="query.gradeInfoId"
            filterable
            clearable
            placeholder="请选择年级">
            <el-option
              v-for="item in gradeInfoListForQuery"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button
            v-if="hasPermission(['system:course:list'])"
            type="success" icon="el-icon-search"
            @click="searchCourse()">查询</el-button>

          <el-button
            v-if="hasPermission(['system:course:save'])"
            type="primary" @click="addCourse">新增</el-button>

          <!-- <el-button
             v-if="hasPermission(['system:course:batchDelete'])"
             @click="batchDelete" type="danger">批量删除</el-button>-->
        </el-form-item>
      </el-form>
      <el-table
        :data="courseList"
        border
        v-loading="loading"
        style="width: 100%;">

        <el-table-column
          prop="name"
          header-align="center"
          align="center"
          label="课程名称">
        </el-table-column>

        <el-table-column
          prop="headImg"
          align="center"
          label="课程封面">
          <template slot-scope="scope">
            <img v-if="scope.row.headImg" style="width: 40px; height: 40px;" :src="fileUrl + scope.row.headImg"/>
          </template>
        </el-table-column>

        <el-table-column
          prop="gradeInfoName"
          header-align="center"
          align="center"
          label="所属年级">
          <template slot-scope="scope">
            <el-tag size="small">{{scope.row.gradeInfoName}}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          header-align="center"
          align="center"
          label="所属科目">
          <template slot-scope="scope">
            <el-tag size="small">{{scope.row.subjectName}}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="status"
          header-align="center"
          align="center"
          label="状态">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.status === 1" type="success" effect="dark">已上架</el-tag>
            <el-tag v-if="scope.row.status === 0" type="warning" effect="dark">草稿</el-tag>
            <el-tag v-if="scope.row.status === 2" type="danger" effect="dark">已下架</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="createDate"
          header-align="center"
          align="center"
          width="180"
          label="创建时间">
        </el-table-column>

        <el-table-column
          header-align="center"
          align="center"
          width="150"
          label="操作">
          <template slot-scope="scope">
            <el-dropdown>
              <span class="el-dropdown-link">
                操作<i class="el-icon-caret-bottom"></i>
              </span>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item
                  @click.native="undercarriageCourse(scope.row, 1)"
                  v-if="scope.row.status !== 1 && hasPermission(['system:course:update'])"
                  icon="el-icon-upload2">上架</el-dropdown-item>
                <el-dropdown-item
                  v-if="scope.row.status === 1 && hasPermission(['system:course:update'])"
                  @click.native="undercarriageCourse(scope.row, 2)"
                  icon="el-icon-download">下架</el-dropdown-item>
                <el-dropdown-item
                  @click.native="updateCourse(scope.row)"
                  v-if="hasPermission(['system:course:update'])"
                  icon="el-icon-edit">修改</el-dropdown-item>
                <el-dropdown-item
                  @click.native="deleteCourseById(scope.row)"
                  v-if="hasPermission(['system:course:deleteById'])"
                  icon="el-icon-delete">删除</el-dropdown-item>

                 <el-dropdown-item
                  @click.native="editCourseSection(scope.row)"
                  icon="el-icon-delete">章节管理</el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        background
        :current-page="currentPage"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="pageSize"
        :total="totalCount"
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>

      <el-dialog
        :title="!form.id ? '新增课程' : '修改课程'"
        :close-on-click-modal="false"
        :visible.sync="showFlag">
        <el-form :model="form" :rules="rules" ref="form" @keyup.enter.native="saveOrUpdate()" label-width="80px">
          <el-form-item label="课程名称" prop="name">
            <el-input v-model="form.name" placeholder="课程名称"></el-input>
          </el-form-item>

          <el-form-item label="课程封面" prop="headImg">
            <div v-if="form.headImg">
              <ul class="el-upload-list el-upload-list--picture-card"
                  style="display: inline-block;">
                <li class="el-upload-list__item is-success">
                  <img :src="fileUrl + form.headImg" alt=""
                       class="el-upload-list__item-thumbnail">
                  <a class="el-upload-list__item-name"><i class="el-icon-document"></i></a>
                  <label class="el-upload-list__item-status-label">
                    <i class="el-icon-upload-success el-icon-check"></i></label> <i
                  class="el-icon-close"></i>
                  <i class="el-icon-close-tip">按 delete 键可删除</i>
                  <span class="el-upload-list__item-actions">
                        <span class="el-upload-list__item-preview"  @click="lookHeadImg"><i
                          class="el-icon-zoom-in"></i></span>
                          <span class="el-upload-list__item-delete" @click="deleteHeadImg"><i
                            class="el-icon-delete"></i></span>
                        </span>
                  <el-dialog
                    :visible.sync="headImageVisible"
                    custom-class="image-dialog"
                    append-to-body>
                    <img width="100%" :src="fileUrl + form.headImg" alt="">
                  </el-dialog>
                </li>
              </ul>
            </div>
            <div v-else>
              <el-upload
                :action="uploadAction"
                :headers="headers"
                :with-credentials="true"
                class="avatar-uploader"
                :on-success="uploadHeadImgSuccess"
                :before-upload="beforeUploadHeadImg"
                :show-file-list="false">
                <i class="el-icon-plus avatar-uploader-icon"></i>
              </el-upload>
            </div>
          </el-form-item>

          <el-form-item label="所属阶段" placeholder="所属阶段" prop="schoolType">
            <el-select
              @change="changeSchoolType"
              v-model="form.schoolType"
              :disabled="form.status === 1"
              filterable
              clearable
              placeholder="请选择">
              <el-option
                v-for="item in schoolTypeList"
                :key="item.id"
                :label="item.value"
                :value="item.code">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="所属年级" placeholder="所属年级" prop="gradeInfoId">
            <el-select
              :disabled="form.status === 1"
              @change="changeGradeInfo"
              v-model="form.gradeInfoId"
              filterable
              clearable
              placeholder="请选择">
              <el-option
                v-for="item in gradeInfoList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>


          <el-form-item label="所属科目" placeholder="所属科目" prop="subjectId">
            <el-select
              :disabled="form.status === 1"
              v-model="form.subjectId"
              filterable
              clearable
              placeholder="请选择">
              <el-option
                v-for="item in subjectList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="课程简介">
            <el-input type="textarea" v-model="form.represent" placeholder="请输入课程简介"></el-input>
          </el-form-item>

          <el-form-item label="首页推荐">
            <el-radio-group v-model="form.recommendIndexFlag">
              <el-radio :label="1">是</el-radio>
              <el-radio :label="0">否</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="排序">
            <el-input v-model="form.sort" placeholder="排序(数字越大,排名越靠前)"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer"  class="dialog-footer">
          <el-button @click="showFlag = false" size="small">取消</el-button>
          <el-button
             type="warning"
             v-if="!form.id || form.status === 0"
             size="small"
             @click="saveOrUpdateCourse(0)">保存草稿</el-button>
          <el-button type="primary" size="small" @click="saveOrUpdateCourse(1)">保存并发布</el-button>
       </span>
      </el-dialog>
    </div>
  </div>
</template>
<script>
  import {getDictValueByType} from '@/api/dict'
  import {getGradeInfoList} from '@/api/gradeInfo'
  import {getSubjectInfoList} from '@/api/subjectInfo'

  export default {
    name: 'course',
    data () {
      let checkCourseName = (rule, value, callback) => {
        if (!value) {
          return callback(new Error('请输入课程名称'))
        }
        callback()
      }
      return {
        questionListDialog: false,
        headers: {
          Authorization: localStorage.getItem('Authorization'),
          Platform: 'educationAdmin'
        },
        fileUrl: this.$http.getFileHost(),
        uploadAction: this.$http.httpUrl('/api/upload/2'),
        currentPage: 1,
        pageSize: 10,
        totalCount: 0,
        showFlag: false,
        form: {
          headImg: '',
          status: 0, // 默认状态为草稿
          name: '',
          recommendIndexFlag: 0,
          represent: '',
          gradeInfoId: '',
          schoolType: '',
          subjectId: '',
          code: '',
          sort: 0
        },
        loading: true,
        query: {
          keyWord: '',
          gradeInfoId: '',
          schoolType: ''
        },

        rules: {
          name: {
            required: true, validator: checkCourseName, trigger: 'blur'
          },
          schoolType: {
            required: true, message: '请选择阶段', trigger: 'blur'
          },
          headImg: {
            required: true, message: '请上传课程封面', trigger: 'blur'
          },
          gradeInfoId: {
            required: true, message: '请选择年级', trigger: 'blur'
          },
          subjectId: {
            required: true, message: '请选择科目', trigger: 'blur'
          },
          represent: {
            required: true, message: '请输入课程介绍', trigger: 'blur'
          }
        },
        queryParams: {
          subject_id: '',
          school_type: '',
          grade_type: '',
          question_type: ''
        },
        headImageVisible: false,
        courseList: [],
        subjectList: [], // 科目列表
        subjectListForQuery: [],
        gradeInfoListForQuery: [],
        schoolTypeList: [],
        gradeInfoList: []
      }
    },

    watch: {
      'form.schoolType' (val) {
        let params = {
          schoolType: val
        }
        getGradeInfoList(params).then(response => {
          this.gradeInfoList = response.data.data.dataList
        })
      },

      'form.gradeInfoId' (val) {
        let params = {
          gradeInfoId: val
        }
        getSubjectInfoList(params).then(response => {
          this.subjectList = response.data.data.dataList
        })
      }
    },

    mounted () {
      this.getCourseList()
      getDictValueByType('school_type').then(response => {
        this.schoolTypeList = response.data.data
      })

    },

    methods: {

      // 上架或下架
      undercarriageCourse (item, status) {
        let message = null
        if (status === 2) {
          message = '确定下架课程' + item.name
        } else if (status === 1) {
          message = '确定上架课程' + item.name
        }
        this.$confirm(message + '?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.form.id = item.id
          this.form = {
            headImg: item.headImg,
            name: item.name,
            gradeInfoId: item.gradeInfoId,
            schoolType: item.schoolType,
            subjectId: item.subjectId,
            sort: item.sort,
            status: status,
            represent: item.represent,
            id: item.id,
            recommendIndexFlag: item.recommendIndexFlag
          }
          this.saveOrUpdate()
        })
      },

      editCourseSection (course) {
        this.$store.commit('map/updateCourse', course)
        this.$router.push({
          name: 'courseSection'
        })
      },

      lookHeadImg () {
        this.headImageVisible = true
      },

      deleteHeadImg () {
        let that = this
        that.$confirm('确定删除该封面吗？')
          .then(function () {
            that.form.headImg = ''
          })
          .catch(function (error) {
            console.log(error)
          })
      },

      updateCourse (item) {
        this.form = {
          headImg: item.headImg,
          name: item.name,
          gradeInfoId: item.gradeInfoId,
          schoolType: item.schoolType,
          subjectId: item.subjectId,
          sort: item.sort,
          status: item.status,
          represent: item.represent,
          id: item.id,
          recommendIndexFlag: item.recommendIndexFlag
        }
        this.showFlag = true
      },

      closeCourseQuestionDialog () {
        this.questionListDialog = false
      },

      saveOrUpdate () {
        this.axios.post(this.$http.httpUrl('/system/course/saveOrUpdate'), this.form)
          .then(response => {
            this.showFlag = false
            if (response.data.code === 1) {
              this.$message({
                type: 'success',
                message: response.data.message
              })
              this.clearForm()
              this.getCourseList()
            }
          })
      },

      saveOrUpdateCourse (status) {
        let that = this
        this.form.status = status
        that.$refs['form'].validate(valid => {
          if (valid) {
            this.saveOrUpdate()
          }
        })
      },

      searchCourse () {
        this.currentPage = 1
        this.getCourseList()
      },

      beforeUploadHeadImg (file) {
        let imgContentType = ['application/x-png', 'application/png', 'image/png', 'image/jpeg', 'image/gif']
        if (imgContentType.indexOf(file.type) === -1) {
          this.$message.error('图片格式错误, 只能上传JPG/PNG 格式,请重新上传')
          return false
        }
        let isLimit = file.size / 1024 / 1024 < 5
        if (!isLimit) {
          this.$message.error('上传图片大小不能超过 5MB!')
          return false
        }
        return true
      },

      uploadHeadImgSuccess (res, file) {
        if (res.code === 1) {
          this.form.headImg = res.url
        } else {
          this.$message.error(res.message)
        }
      },

      addCourse () {
        this.showFlag = true
        this.clearForm()
      },

      clearForm () {
        this.form = {
          status: 0,
          recommendIndexFlag: 0,
          headImg: '',
          name: '',
          gradeInfoId: '',
          represent: '',
          schoolType: '',
          subjectId: '',
          code: '',
          sort: 0
        }
      },
      // 每页数
      sizeChangeHandler (val) {
        this.pageSize = val
        this.currentPage = 1
        this.getCourseList()
      },
      // 当前页
      currentChangeHandler (val) {
        this.currentPage = val
        this.getCourseList()
      },

      deleteCourseById (item) {
        let that = this
        that.$confirm('确定删除课程' + item.name + ',此操作将删除该课程及其关联数据, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function () {
          that.axios.delete(that.$http.httpUrl('/system/course/' + item.id)).then(function (response) {
            if (response.data.code === 1) {
              that.$message({
                type: 'success',
                message: response.data.message
              })
              that.getCourseList()
            }
          })
        })
      },

      changeSchoolTypeForQuery (val) {
        this.query.gradeInfoId = ''
        this.query.subjectId = ''
        let params = {
          schoolType: val
        }
        getGradeInfoList(params).then(response => {
          this.gradeInfoListForQuery = response.data.data.dataList
        })
      },

      changeSchoolType () {
        this.form.gradeInfoId = ''
        this.form.subjectId = ''
      },

      changeGradeInfo () {
        this.form.subjectId = ''
      },

      getCourseList () {
        let that = this
        that.axios.get(that.$http.httpUrl('/system/course'), {
          params: {
            pageNumber: that.currentPage,
            pageSize: that.pageSize,
            name: that.query.keyWord,
            schoolType: that.query.schoolType,
            gradeInfoId: that.query.gradeInfoId
          }
        }).then(function (response) {
          that.loading = false
          that.courseList = response.data.data.dataList
          that.totalCount = response.data.data.total
        })
      }

    },

    filters: {

    }
  }
</script>
<style>
  .el-table__expand-icon {
    display: inline-block;
    margin-right: 15px;
    vertical-align:-5px;
  }

  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  .avatar-uploader .el-upload:hover {
    border-color: #409EFF;
  }
  .avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 90px;
    height: 90px;
    line-height: 90px;
    text-align: center;
  }
  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>

