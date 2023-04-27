<template>
  <div class="mod-user">
    <div class="mod-user">
      <el-form :inline="true">
        <el-form-item>
          <el-button
            type="primary" @click="addCourseSection">新增新章节</el-button>

          <el-button
            type="primary">新增新课时</el-button>

          <el-button
            type="primary">调整课时顺序</el-button>
        </el-form-item>
      </el-form>

      <el-collapse v-model="activeNames" @change="handleChange" accordion>
        <el-collapse-item
          v-for="(item, index) in courseSectionList"
          :key="item.id">

          <template slot="title">
            <div style="width: 88%">
              <i style="font-size: 16px" class="el-icon-document-copy"></i>
              <label style="font-size: 16px; padding-left: 5px">第{{index + 1}}章 {{item.title}}</label>
            </div>


            <div style="margin-right: 5px">
              <el-button type="text" @click.stop="updateCourseSection(item)" class="el-icon-edit" >编辑</el-button>
            </div>
            <div>
              <el-button style="float: right" class="el-icon-circle-plus-outline" type="text" @click.stop="addClassHour(item)" >添加课时</el-button>
            </div>
          </template>
          <div v-for="(node, nodeIndex) in item.courseSectionNodeList" class="classHour">
            <template v-if="node.title">
              <div class="section">第{{nodeIndex + 1}}节</div>
              <div class="section_title">{{node.title}}</div>
              <div class="section_info">
                <label v-if="node.createDate" class="label_tag">创建时间：{{node.createDate}}</label>
                <label v-if="node.videoInfo" class="label_tag">视频已上传</label>
                <label v-else class="label_tag">视频未上传</label>
                <label v-if="node.enclosure" class="label未_tag">课件已上传</label>
                <label v-else class="label_tag">课件未上传</label>
              </div>
              <div style="width:20%" class="section_info">
                <el-upload
                  style="display: inline-block"
                  class="upload-demo"
                  :headers="headers"
                  :action="uploadAction"
                  :show-file-list="showFileFlag"
                  :on-success="uploadSectionNodeVideoSuccess"
                  :before-upload="beforeUploadSectionNodeVideo"
                >
                  <el-button @click="getNodeInfo(node, index, nodeIndex, true)" type="text">更换视频</el-button>
                </el-upload>
                <el-button @click="updateSectionNode(node, index, nodeIndex, false)" type="text">编辑</el-button>
                <el-button @click="deleteSectionNode(node)" type="text">删除</el-button>
              </div>
            </template>
          </div>

          <div v-if="addSectionNodeFlag">
            <el-form
              :model="sectionNodeForm"
              :rules="sectionNodeFormRules"
              ref="form" label-width="100px" class="demo-ruleForm">
              <el-form-item label="课时名称" prop="title">
                <el-input v-model="sectionNodeForm.title"></el-input>
              </el-form-item>

              <el-form-item label="课时简介" prop="synopsis">
                <el-input v-model="sectionNodeForm.synopsis"></el-input>
              </el-form-item>

              <el-form-item>
                <el-button @click="saveSectionNode(index)" type="primary">完成</el-button>
                <el-button @click="addSectionNodeFlag = false">取消</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-collapse-item>
      </el-collapse>
    </div>
  </div>
</template>
<script>
  import {getCourseSectionList} from '@/api/course'
  import { mapGetters } from 'vuex'
  export default {
    name: 'courseSection',
    data () {
      return {
        videoFileType: [
          'video/mp4',
          'video/mpeg4',
          'video/avi',
          'video/mpeg',
          'video/x-ms-wmv',
          'video/3gp'
        ],
        showFileFlag: true,
        activeNames: ['1'],
        headers: {
          Authorization: localStorage.getItem('Authorization'),
          Platform: 'educationAdmin'
        },
        fileUrl: this.$http.getFileHost(),
        uploadAction: this.$http.httpUrl('/api/upload/1'),
        loading: true,
        addSectionNodeFlag: false,
        courseSectionList: [],
        sectionNodeForm: {
          id: null,
          videoInfo: null,
          synopsis: '',
          title: '',
          courseId: null,
          courseSectionId: null
        },
        updateNodeIndex: null,
        sectionNodeFormRules: {
          title: [
            {required: true, message: '请输入课时名称', trigger: 'blur'}
          ],
          synopsis: [
            {required: true, message: '请输入课时简介', trigger: 'blur'}
          ]
        }
      }
    },

    computed: {
      ...mapGetters({
        course: 'map/getCourse'
      })
    },

    watch: {

    },

    mounted () {
      this.getCourseSectionList()
    },

    methods: {

      updateSectionNode (node, index, nodeIndex, updateActionUrl) {
        this.getNodeInfo(node, index, nodeIndex, updateActionUrl)
        this.updateNodeIndex = nodeIndex
        this.addSectionNodeFlag = !this.addSectionNodeFlag
      },

      getCourseSectionList () {
        getCourseSectionList(this.course.id).then((response) => {
          this.courseSectionList = response.data.data
        })
      },

      beforeUploadSectionNodeVideo (file) {
        if (this.videoFileType.indexOf(file.type) === -1) {
          this.$message.error('视频格式错误,请优先上传mp4格式文件')
          return false
        }
      },

      getNodeInfo (node, index, nodeIndex, updateActionUrl) {
        this.sectionNodeForm = {
          id: node.id,
          videoInfo: node.videoInfo,
          synopsis: node.synopsis,
          title: node.title,
          courseId: node.courseId,
          courseSectionId: node.courseSectionId,
          index: index,
          nodeIndex: nodeIndex
        }
        if (updateActionUrl) {
          this.uploadAction = this.$http.httpUrl('/api/upload/' + node.courseId + '/' + node.id + '/courseSectionNode')
        }
      },

      uploadSectionNodeVideoSuccess (res, file) {
        this.showFileFlag = false
        if (res.code === 1) {
          let videoInfo = {
            url: res.url,
            name: file.name
          }
          this.sectionNodeForm.videoInfo = videoInfo

          let courseSection = this.courseSectionList[this.sectionNodeForm.index]
          let courseSectionNode = courseSection.courseSectionNodeList[this.sectionNodeForm.nodeIndex]
          courseSectionNode.videoInfo = this.sectionNodeForm.videoInfo

        } else {
          this.$message.error(res.message)
        }
      },

      handleChange (val) {
        console.log(val)
      },

      addCourseSection () {
        this.$prompt('请输入章节名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消'
        }).then(({ value }) => {
          let params = {
            courseId: this.course.id,
            title: value
          }
          this.saveOrUpdateCourseSection(params)
        }).catch(() => {

        })
      },

      updateCourseSection (item) {
        this.$prompt('请输入章节名称', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          inputValue: item.title
        }).then(({ value }) => {
          let params = {
            id: item.id,
            courseId: this.course.id,
            title: value
          }
          this.saveOrUpdateCourseSection(params)
        })
      },

    deleteSectionNode (item) {
      this.$message.info('功能开发中')
    },

      saveOrUpdateCourseSection (params) {
        this.axios.post(this.$http.httpUrl('/system/course/section'), params)
          .then(response => {
            if (response.data.code === 1) {
              this.$message({
                type: 'success',
                message: response.data.message
              })
            }
            this.getCourseSectionList()
          })
      },

      addClassHour (section) {
        this.addSectionNodeFlag = !this.addSectionNodeFlag
        this.sectionNodeForm.courseId = section.courseId
        this.sectionNodeForm.courseSectionId = section.id
        this.sectionNodeForm.title = ''
        this.sectionNodeForm.synopsis = ''
      },

      clearSectionNodeForm () {
        this.sectionNodeForm = {
          synopsis: '',
          title: '',
          courseId: null,
          courseSectionId: null
        }
      },

      saveSectionNode (index) {
        if (!this.sectionNodeForm.title) {
          this.$message.error('请输入课时名称')
          return false
        }

        if (!this.sectionNodeForm.synopsis) {
          this.$message.error('请输入课时简介')
          return false
        }

        this.axios.post(this.$http.httpUrl('/system/course/section/node'), this.sectionNodeForm)
          .then(response => {
            let courseSectionNodeList = this.courseSectionList[index].courseSectionNodeList
            // 代表编辑时缓存的节点元素下标
            let courseSectionInfo = null
           // console.log("this.updateNodeIndex" + this.updateNodeIndex)
            if (this.updateNodeIndex !== null) {
               courseSectionInfo = courseSectionNodeList[this.updateNodeIndex]
               courseSectionInfo.title = this.sectionNodeForm.title,
               courseSectionInfo.courseId = this.sectionNodeForm.courseId,
               courseSectionInfo.courseSectionId = this.sectionNodeForm.courseSectionId,
               courseSectionInfo.synopsis = this.sectionNodeForm.synopsis
            } else {
              // 添加课时
              courseSectionNodeList.push({
                title: this.sectionNodeForm.title,
                courseId: this.sectionNodeForm.courseId,
                courseSectionId: this.sectionNodeForm.courseSectionId,
                synopsis: this.sectionNodeForm.synopsis,
                createDate: response.data.data.createDate
              })
            }

            this.addSectionNodeFlag = false
            this.clearSectionNodeForm()
            this.updateNodeIndex = null // 添加或修改课时之后清空缓存课时下标
            if (response.data.code === 1) {
              this.$message({
                type: 'success',
                message: response.data.message
              })
            }
          })
      }
    },

    filters: {

    }
  }
</script>
<style>

  .classHour {
    display: flex;
    margin: 8px;
    width: 100%;
    line-height: 40px;
    padding-left: 10px;
    /* background: #dfdfdf;*/
  }

  .section {
    width: 5%;
    padding: 5px 5px 5px 11px;
    color: white;
    background: #999aaa;
  }

  .section_info .label_tag {
    display: inline-block;
    margin-right: 40px;
  }

  .section_title {
    width: 25%;
    font-size: 16px;
    padding: 5px;
    background: #dfdfdf;
    float: left;
  }

  .section_info {
    width: 50%;
    padding: 5px;
    background: #dfdfdf;
    float: left;
  }

</style>
