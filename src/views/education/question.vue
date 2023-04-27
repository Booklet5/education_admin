<template>
  <div>
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane label="试题管理" name="questions_list">
        <el-form :model="query" :inline="true">
          <education-search
            @click="searchQuestion"
            :school_type_list="schoolTypeList"
            permission="system:question:list">
          </education-search>
        </el-form>
        <el-table
          v-loading="tableLoading"
          border
          :data="questionsList"
          style="width: 100%">
          <el-table-column
            type="selection"
            width="55">
          </el-table-column>

          <el-table-column
            prop="content"
            align="center"
            :show-overflow-tooltip="true"
            label="试题内容"
            min-width="150">
            <template slot-scope="scope">
              <div v-html="scope.row.content"></div>
            </template>
          </el-table-column>

          <el-table-column
            v-if="showTableHeader"
            prop="subjectName"
            align="center"
            width="100"
            label="科目">
          </el-table-column>

          <el-table-column
            v-if="showTableHeader"
            align="center"
            sortable
            label="阶段"
            width="100">
            <template slot-scope="scope">
              <el-tag v-if="scope.row.schoolType === 1" size="small">小学</el-tag>
              <el-tag v-else-if="scope.row.schoolType === 2" size="small">初中</el-tag>
              <el-tag v-else-if="scope.row.schoolType === 3" size="small">高中</el-tag>
            </template>
          </el-table-column>

          <el-table-column
            v-if="showTableHeader"
            width="150"
            align="center"
            sortable
              prop="gradeInfoName"
            label="年级">
          </el-table-column>

          <el-table-column
            width="100"
            align="center"
            label="类型">
            <template slot-scope="scope">
              <el-tag size="small" >{{scope.row.questionType | getQuestionTypeName}}</el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="createDate"
            align="center"
            width="120"
            sortable
            label="创建时间">
          </el-table-column>

          <el-table-column
            header-align="center"
            align="center"
            width="200"
            label="操作">
            <template slot-scope="scope">

              <el-button
                size="small"
                icon="el-icon-view"
                @click="lookQuestion(scope.row)"
                type="text">预览</el-button>

              <el-button
                size="small"
                icon="el-icon-edit"
                v-if="hasPermission(['system:question:update'])"
                @click="updateQuestion(scope.row)"
                type="text">修改</el-button>

              <el-button
                size="small"
                icon="el-icon-delete"
                v-if="hasPermission(['system:question:deleteById'])"
                @click="deleteById(scope.row)"
                type="text">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          :total="totalCount"
          layout="total, sizes, prev, pager, next, jumper">
        </el-pagination>

        <question-preview
          @closeQuestionPreview="closeQuestionPreview"
          :questionInfo="rowQuestion"
          :openFlag="questionPreviewFlag">
        </question-preview>

      </el-tab-pane>

      <el-tab-pane v-if="hasPermission(['system:question:save', 'system:question:update'])"  :label="labelName" name="questions_form">
         <el-form :model="form" :rules="rules" ref="form" label-width="100px" class="demo-ruleForm">
          <el-col :span="12">
            <el-form-item label="阶段:" prop="schoolType">
              <el-select
                clearable filterable
                @change="changeSchoolType"
                v-model="form.schoolType"
               placeholder="请选择阶段">
                <el-option
                  v-for="item in schoolTypeList"
                  :key="item.id"
                  :label="item.value"
                  :value="item.code">
                </el-option>
              </el-select>
            </el-form-item>

            <el-form-item label="类型:"  prop="questionType">
              <el-select clearable filterable @change="changeQuestionType" v-model="form.questionType" placeholder="请选择试题类型">
                <el-option
                  v-for="item in questionTypeList"
                  :key="item.id"
                  :label="item.value"
                  :value="item.code">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="年级:" prop="gradeInfoId">
              <el-select clearable filterable @change="changeGradeType" v-model="form.gradeInfoId" placeholder="请选择年级">
                <el-option
                  v-for="item in changeGradeTypeList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

          <el-col :span="12">
            <el-form-item label="科目:" prop="subjectId">
              <el-select @change="changeSubject" clearable filterable v-model="form.subjectId" placeholder="请选择科目">
                <el-option
                  v-for="item in subjectList"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>

           <el-col :span="24">
             <el-form-item label="知识点:" placeholder="请选择试题知识点">
               <el-popover
                 style="width: 40%"
                 ref="treeListPopover"
                 placement="bottom-start"
                 trigger="click"
                 v-model="visible"
                 popper-class="mod-menu__icon-popover">
                 <div class="mod-menu__icon-inner">
                   <div class="mod-menu__icon-list">
                     <el-tree
                       :data="treeLanguagePointsList"
                       show-checkbox
                       ref="treeLanguagePoints"
                       @check-change="handleCheckChange"
                       v-loading="loading"
                       lazy
                       :props="{ children: 'children', label: 'name'}"
                       :check-strictly="true"
                       :load="loadLanguagePointsChildren"
                       node-key="id">
                     </el-tree>
                   </div>
                 </div>
               </el-popover>

                 <!-- <div class="tag_list">
                    <el-tag type="success">标签二</el-tag>
                  </div>-->
               <!--<el-tag type="success">标签二</el-tag>-->
               <el-tag
                 v-for="tag in selectedLanguagePoints"
                 :key="tag.id"
                 closable
                 @close="removeLanguagePoints(tag)"
                 type="success">
                 {{tag.label}}
               </el-tag>

               <el-input
                 v-popover:treeListPopover
                 :readonly="true" placeholder="请至少选择一个知识点"
                 class="icon-list__input">
               </el-input>
             </el-form-item>
           </el-col>

          <el-col :span="24">
            <el-form-item label="题目:">
              <script id="editor" ref="ueditor" type="text/plain">{{form.content}}</script>
            </el-form-item>
          </el-col>

           <el-col :span="24">
             <el-form-item label="总结升华:">
               <script id="summarizeEditor" ref="summarizeEditor" type="text/plain">{{form.summarize}}</script>
             </el-form-item>
           </el-col>

           <el-col :span="24">
             <el-form-item label="试题解析:">
               <script id="analysisEditor" ref="analysisEditor" type="text/plain">{{form.analysis}}</script>
             </el-form-item>
           </el-col>

           <el-col v-if="form.questionType == 1 || form.questionType == 2" :span="24">
              <el-form-item
                 v-for="(option, index) in form.optionList"
                 :label="'选项' + option.label"
                 :key="index" >
                <el-input @focus="openMathOptionsEditor(index)" v-model="option.option_name" style="width: 200px;"></el-input>
                <el-button v-if="index === 0" @click="addOption" type="warning">添加选项</el-button>
                <el-button v-else type="danger" @click="deleteOption(option.label, index)">删除选项</el-button>
               </el-form-item>

             <el-dialog
               :show-close="false"
               style="width: 100%; height: 100%"
               :visible.sync="dialogFormVisible">
               <baidu-editor :config="{zIndex: 5000}" @ready="optionEditorReady"></baidu-editor>
               <div slot="footer" class="dialog-footer">
                 <el-button @click="dialogFormVisible = false" size="small">取 消</el-button>
                 <el-button size="small" @click="saveOptionValue" type="primary">确 定</el-button>
               </div>
             </el-dialog>
           </el-col>

           <el-col :span="24">
            <el-form-item label="答案:" prop="answer">
               <template>
                   <script id="answerEditor"  type="text/plain" ></script>
               </template>

              <!--- 显示单选题答案选项 -->
              <template v-if="form.questionType === 1">
                <el-radio-group v-model="form.answer">
                  <el-radio
                    :key="index"
                    v-for="(option, index) in radioOptionList"
                    :label="option">{{option}}</el-radio>
                </el-radio-group>
              </template>

              <template v-if="form.questionType === 2">
                <el-checkbox-group v-model="answerList">
                  <el-checkbox
                    :key="index"
                    v-for="(option, index) in checkBoxOptionList"
                    :label="option">
                  </el-checkbox>
                </el-checkbox-group>
              </template>

              <template v-if="form.questionType === 6">
                <el-radio-group v-model="form.answer">
                  <el-radio :label="1">对</el-radio>
                  <el-radio :label="0">错</el-radio>
                </el-radio-group>
              </template>
            </el-form-item>
          </el-col>

           <el-col :span="24">
             <el-form-item label="讲解视频:">
               <el-upload
                   class="upload-demo"
                   :action="uploadAction"
                   multiple
                   :headers="headers"
                   :show-file-list="showFile"
                   :before-upload="beforeUploadVideo"
                   :on-success="uploadVideoSuccess"
                   :on-remove="removeVideo"
                   :before-remove="beforeRemoveVideo"
                   :file-list="form.videoList">
                   <el-button size="small" icon="el-icon-upload" type="primary">点击上传</el-button>
                   <div slot="tip" class="el-upload__tip">只能上传视频文件</div>
               </el-upload>
             </el-form-item>
           </el-col>

          <el-col :span="24">
              <el-form-item>
                <el-button type="success" :disabled="uploadVideoRunning" v-if="form.id" @click="saveOrUpdateQuestions">修改</el-button>
                <el-button type="success" :disabled="uploadVideoRunning" v-else @click="saveOrUpdateQuestions">保 存</el-button>
              </el-form-item>
          </el-col>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>
<script>
  import baiduEditor from '@/components/baidu-ueditor'
  import questionPreview from '@/components/education/question-preview'
  import ueditor from 'ueditor'
  import {getDictValueByType} from '@/api/dict'
  import {getGradeInfoList} from '@/api/gradeInfo'
  import {selectByParentId, selectFirstPoints} from '@/api/languagePoints'
  import {getSubjectInfoList} from '@/api/subjectInfo'
  import educationSearch from '@/components/education/education-search'
  let thisPage = null
  export default {
    name: 'question',
    components: {educationSearch, baiduEditor, questionPreview},
    data () {
      return {
        questionPreviewFlag: false,
        visible: false,
        dialogFormVisible: false,
        radioOptionList: [], // 存储单选题答案选项
        checkBoxOptionList: [], // 存储多选题答案选项
        tableLoading: true,
        loading: true,
        headers: {
          Authorization: localStorage.getItem('Authorization'),
          Platform: 'educationAdmin'
        },
        uploadAction: this.$http.httpUrl('/api/upload/1'),
        uploadExcelAction: this.$http.httpUrl('/system/question/uploadExcel'),
        currentPage: 1,
        totalCount: 0,
        pageSize: 10,
        labelName: '添加试题',
        activeName: 'questions_list',
        answerList: [],
        showTableHeader: true,
        treeLanguagePointsList: [],
        formTreeLanguagePointsList: [],
        answer: '',
        selectedLanguagePoints: [], // 选择的知识点 {id: 1, label: 'test'}
        form: {
          languagePointsInfoId: [],
          analysis: '',
          gradeInfoId: '',
          questionType: '',
          schoolType: '',
          subjectId: '',
          content: '',
          answer: '',
          videoList: [],
          options: '',
          optionList: [],
          summarize: ''
        },
        optionEditorIndex: 0,
        optionEditorInstance: null,
        modeTypeList: [],
        query: {
          content: '',
          subjectId: '',
          gradeInfoId: '',
          schoolType: ''
        },
        uploadVideoRunning: false, // 是否正在上传教学视频
        questionsList: [],
        questionTypeList: [],
        showFile: true,
        gradeTypeList: [], // 年级列表
        schoolTypeList: [],  // 所属阶段列表
        subjectList: [],
        videoType: [
          'video/mp4',
          'video/mpeg4',
          'video/avi',
          'video/mpeg',
          'video/x-ms-wmv',
          'video/3gp'
        ],
        rules: {

          schoolType: {
            required: true, message: '请选择阶段', trigger: 'blur'
          },

          questionType: {
            required: true, message: '请选择试题类型', trigger: 'blur'
          },

          gradeInfoId: {
            required: true, message: '请选择年级', trigger: 'blur'
          },

          subjectId: {
            required: true, message: '请选择科目', trigger: 'blur'
          }

         /* languagePointsInfoId: {
            required: true, message: '请至少选择一个知识点', trigger: 'blur'
          } */

        },
        mathEditor: null,
        optionEditorArray: [], // 存储答案富文本对象
        changeGradeTypeList: [],
        parentCourseList: [],
        editor: null,
        answerEditor: null,
        analysisEditor: null,
        summarizeEditor: null,
        rowQuestion: {},
        config: {
          zIndex: 0
        }
      }
    },

    beforeCreate () {
      thisPage = this
    },

    watch: {
      'form.schoolType' (val) {
        let params = {
          schoolType: val
        }
        getGradeInfoList(params).then(response => {
          this.changeGradeTypeList = response.data.data.dataList
        })
      },

      'form.gradeInfoId' (val) {
        let params = {
          gradeInfoId: val
        }
        getSubjectInfoList(params).then(response => {
          this.subjectList = response.data.data.dataList
        })
      },

      'form.subjectId' (val) {
        let params = {
          gradeInfoId: this.form.gradeInfoId,
          subjectId: val
        }
        selectFirstPoints(params).then(response => {
          this.treeLanguagePointsList = response.data.data
        })
      }
    },

    mounted () {
      let that = this
      ueditor.delEditor('editor') // 解决编辑器显示不出来，刷新一下就正常显示的问题
      ueditor.delEditor('answerEditor')
      ueditor.delEditor('analysisEditor')
      ueditor.delEditor('summarizeEditor')

      // 拥有添加或修改权限在加载富文本，否则会出现找不到富文本dom节点而报错
      if (this.hasPermission(['system:question:save', 'system:question:update'])) {
        that.editor = ueditor.getEditor('editor', that.config)
        that.editor.offsetWidth = '100'
        that.answerEditor = ueditor.getEditor('answerEditor', that.config)
        that.answerEditor.offsetWidth = '100'
        that.analysisEditor = ueditor.getEditor('analysisEditor', that.config)
        that.analysisEditor.offsetWidth = '100'

        that.summarizeEditor = ueditor.getEditor('summarizeEditor', that.config)
        that.summarizeEditor.offsetWidth = '100'
        that.editor.addListener('ready', () => {
          that.editor.setShow(true)
        })

        that.answerEditor.addListener('ready', () => {
          that.answerEditor.setShow(true)
        })

        that.analysisEditor.addListener('ready', () => {
          that.analysisEditor.setShow(true)
        })

        that.summarizeEditor.addListener('ready', () => {
          that.summarizeEditor.setShow(true)
        })
      }

      that.getQuestionList()

      getDictValueByType('school_type').then(response => {
        this.schoolTypeList = response.data.data
      })

      getDictValueByType('question_type').then(response => {
        this.questionTypeList = response.data.data
      })
    },

    methods: {

      // 删除试题知识点
      removeLanguagePoints (tag) {
        let treeIds = []
        let deleteIds = [] // 记录需要移除的元素id
        let length = this.selectedLanguagePoints.length
        for (let i = 0; i < length; i++) {
          let item = this.selectedLanguagePoints[i]
          if (item.id === tag.id) {
            deleteIds.push(item.id)
          } else {
            treeIds.push(item.id)
          }
        }

        for (let i = 0; i < deleteIds.length; i++) {
          this.selectedLanguagePoints.splice(this.selectedLanguagePoints
            .findIndex(item => item.id === deleteIds[i]), 1)
        }

        this.$refs.treeLanguagePoints.setCheckedKeys(treeIds)
      },

      handleCheckChange (data, checked) {
        let result = this.selectedLanguagePoints.some(item => {
          return item.id === data.id
        })
        if (checked) {
          if (!result) {
            this.selectedLanguagePoints.push({
              id: data.id,
              label: data.name
            })
          }
        } else {
          if (result) { // 判断元素存在再删除元素 否则会出现莫名其妙的bug
            this.selectedLanguagePoints.splice(this.selectedLanguagePoints.findIndex(item => item.id === data.id), 1)
          }

          /* for (let i in this.selectedLanguagePoints) {
            let item = this.selectedLanguagePoints[i]
            if (item.id === data.id) {
              this.selectedLanguagePoints.splice(i, 1)
            }
          } */
        }
      },

      loadLanguagePointsChildren (treeNode, resolve) {
       // if (this.form.subjectId != '' && this.form.subjectId != null) {
        let parentId = 0
        if (treeNode.data && treeNode.data.id) {
          parentId = treeNode.data.id
        }
        let params = {
          parentId: parentId
        }
        selectByParentId(params).then(response => {
          this.loading = false
          return resolve(response.data.data)
        })
       // }
       // return resolve([])
      },

      saveOptionValue () {
        let option = this.form.optionList[this.optionEditorIndex]
        option.option_name = this.optionEditorInstance.getContent()
        this.dialogFormVisible = false
      },

      optionEditorReady (instance) {
        this.optionEditorInstance = instance
      },

      // 打开选项富文本并设置内容
      openMathOptionsEditor (index) {
        this.dialogFormVisible = true
        this.optionEditorIndex = index
        this.optionEditorInstance.setContent('')
        let option = this.form.optionList[this.optionEditorIndex]
        this.optionEditorInstance.setContent(option.option_name)
      },

      // 试题预览
      lookQuestion (item) {
        this.questionPreviewFlag = true
        this.rowQuestion = item
      },

      changeSubject (val) {
      /*  let params = {
          gradeInfoId: this.form.gradeInfoId,
          subjectId: val
        }
        selectFirstPoints(params).then(response => {
          this.treeLanguagePointsList = response.data.data
        }) */
      },

      searchQuestion (val) {
        this.query.subjectId = val.subjectId
        this.query.schoolType = val.schoolType
        this.query.gradeInfoId = val.gradeInfoId
        this.query.content = val.keyWord
        this.currentPage = 1
        this.getQuestionList()
      },

      // 模板下载
      downTemplate () {
        let name = encodeURI('试题模板')
        location.href = this.$http.getFileHost() + '/excel/' + name + '.xlsx'
      },

      // 选中阶段
      changeSchoolType (val) {
        this.form.gradeInfoId = ''
        this.form.languagePointsArrayId = []
        this.form.subjectId = ''
      },

      // 年级切换
      changeGradeType (val) {
        if (this.form.subjectId) {
          this.form.subjectId = ''
        }
      },

      // 选项
      deleteOption (label, index) { // 删除选项
        this.form.optionList.splice(index, 1)
        if (this.form.questionType === 1) {
          this.radioOptionList.splice(index, 1)
        } else {
          this.checkBoxOptionList.splice(index, 1)
        }
      },

      uploadExcelSuccess (res, file) {
        this.loading.close()
        if (res.code === 1) {
          this.$message.success(res.message)
          this.getQuestionList()
        } else {
          this.$message.error(res.message)
        }
      },

      beforeUploadExcel (file) {
        this.loading = this.$loading({
          lock: true,
          text: '数据导入中, 请等待',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        return true
      },

      changeQuestionType (val) {
        if (val !== 1 && val !== 2 && val !== 6) {
          this.answerEditor.setShow(true)
          return
        } else if (val === 1 || val === 2) {
          this.form.optionList = []
          this.form.optionList.push({
            'label': 'A',
            'option_name': ''
          })

          if (val === 1) {
            this.radioOptionList = []
            this.radioOptionList.push('A')
          } else if (val === 2) {
            this.checkBoxOptionList = []
            this.checkBoxOptionList.push('A')
          }
        }
        this.answerEditor.setHide(true)
      },

      // 添加选项
      addOption () {
        let label = String.fromCharCode('A'.charCodeAt() + this.form.optionList.length) // 动态生成A B C D
        this.form.optionList.push({
          label: label,
          option_name: ''
        })

        // 单选题
        if (this.form.questionType === 1) {
          this.radioOptionList.push(label)
          // 多选题
        } else if (this.form.questionType === 2) {
          this.checkBoxOptionList.push(label)
        }
      },

      beforeUploadVideo (file) {
        if (this.videoType.indexOf(file.type) === -1) {
          this.showFile = false
          this.$message.error('视频格式错误')
          return false
        } else if (this.form.videoList.length > 1) {
          this.$message.error('您只能上传一个视频')
          return false
        } else {
          this.uploadVideoRunning = true
          this.showFile = true
        }
        return true
      },

      // 视频上传成功回调
      uploadVideoSuccess (res, file) {
        this.uploadVideoRunning = false
        if (res.code === 1) {
          this.$message.success(res.message)
          this.form.videoList.push({
            url: res.url,
            name: file.name
          })
        } else {
          this.$message.error(res.message)
          return false
        }
      },
      // 删除视频
      removeVideo (file) {
        let index = this.form.videoList.indexOf(file.url)
        this.form.videoList.splice(index, 1)
      },

      beforeRemoveVideo (file, fileList) {
        let name = file.name
        return this.$confirm('确定移除讲解视频' + name + '?')
      },

      closeQuestionPreview () {
        this.questionPreviewFlag = false
      },

      handleSizeChange (val) {
        this.pageSize = val
        this.currentPage = 1
        this.getQuestionList()
      },

      handleCurrentChange (val) {
        this.tableLoading = true
        this.currentPage = val
        this.getQuestionList()
      },

      updateQuestion (item) {
        this.axios.get(this.$http.httpUrl('/system/question/selectById'), {
          params: {
            id: item.id
          }
        }).then(response => {
          let result = response.data.data
          let languagePointsInfoList = result.languagePointsInfoList
          this.selectedLanguagePoints = []
          this.form.languagePointsInfoId = []
          languagePointsInfoList.forEach(item => {
            this.form.languagePointsInfoId.push(item.id)
            this.selectedLanguagePoints.push({
              id: item.id,
              label: item.name
            })
          })
          this.$refs.treeLanguagePoints.setCheckedKeys(this.form.languagePointsInfoId)
         // this.form.languagePointsInfoId = result.languagePointsInfoId
          this.form.schoolType = item.schoolType
          this.form.gradeInfoId = item.gradeInfoId
          this.activeName = 'questions_form'
          this.labelName = '修改试题'
          let videoNewList = []
          this.form.answer = item.answer
          this.form.summarize = item.summarize
          this.editor.setContent(item.content)
          if (item.analysis) {
            this.analysisEditor.setContent(item.analysis)
          }
          if (item.summarize) {
            this.summarizeEditor.setContent(item.summarize)
          }
            // 获取试题类型 // 主观题富文本设置答案
          if (item.questionType !== 1 && item.questionType !== 2 && item.questionType !== 6) {
            this.answerEditor.setContent(item.answer)
          } else {
           // 处理选择题,判断题答案
            this.answerEditor.setHide(true)
            if (item.questionType === 1 || item.questionType === 2) {
              this.answerEditor.setHide(false)
              this.form.options = item.options
              this.form.optionList = JSON.parse(item.options)
              this.radioOptionList = []
              this.checkBoxOptionList = []
              // 初始化答案选项
              for (let i = 0; i < this.form.optionList.length; i++) {
                let label = String.fromCharCode('A'.charCodeAt() + i)
                this.radioOptionList.push(label)
                this.checkBoxOptionList.push(label)
              }

              // 处理多选题答案
              if (item.questionType === 2) {
                if (item.answer) {
                  item.answer.split(',').forEach(item => {
                    if (item) {
                      this.answerList.push(item)
                    }
                  })
                }
              }
            } else if (item.questionType === 6) { // 选择题
              this.answerEditor.setHide(false)
              this.form.answer = parseInt(item.answer) // 注: 组件不支持数字字符串绑定
            }
          }

          if (item.videoUrl) {
            item.videoUrl.split(',').forEach(function (item) {
              if (item !== '') {
                let index = item.lastIndexOf('/')
                let fileName = item.substr(index + 1, item.length)
                videoNewList.push({
                  'name': fileName,
                  'url': item
                })
              }
            })
          }
          this.form.id = item.id
          this.form.videoList = videoNewList
          this.form.content = item.content
          this.form.questionType = item.questionType
          this.form.subjectId = item.subjectId
        })
      },

      // 试题列表
      getQuestionList () {
        let that = this
        that.axios.get(that.$http.httpUrl('/system/question'), {
          params: {
            pageNumber: that.currentPage,
            pageSize: that.pageSize,
            content: that.query.content,
            subjectId: that.query.subjectId,
            gradeInfoId: that.query.gradeInfoId,
            schoolType: that.query.schoolType
          }
        }).then(function (response) {
          that.tableLoading = false
          that.questionsList = response.data.data.dataList
          that.totalCount = response.data.data.total
        }).catch(function (error) {
          console.log(error)
        })
      },

      /* getGradeTypeList () {
        let that = this
        that.axios.get(that.$http.httpUrl('/system/dict'), {
          params: {
            type: 'grade_type'
          }
        }).then(function (response) {
          that.gradeTypeList = response.data.data.dataList
          that.changeGradeTypeList = response.data.data.dataList
        }).catch(function (error) {
          console.log(error)
        })
      }, */

      handleClick (tab) {
        let selectTab = tab.name
        if (selectTab === 'questions_list') {
          this.labelName = '添加试题'
        }
        this.selectedLanguagePoints = []
        this.$refs.treeLanguagePoints.setCheckedKeys([])
        this.treeLanguagePointsList = []
        this.clearForm(this)
      },

      deleteById (item) {
        let that = this
        that.$confirm('此操作将删除试题及其关联数据？删除后将不可恢复,是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(function () {
          that.axios.delete(that.$http.httpUrl('/system/question/' + item.id), {
            data: item
          }).then(function (response) {
            if (response.data.code === 1) {
              that.$message({
                type: 'success',
                message: response.data.message
              })
              that.getQuestionList()
            } else {
              that.$message({
                type: 'error',
                message: response.data.message
              })
            }
          })
        })
      },

      saveOrUpdateQuestions () {
        let that = this
        this.form.languagePointsInfoId = []
        this.selectedLanguagePoints.forEach(item => {
          this.form.languagePointsInfoId.push(item.id)
        })

        that.$refs['form'].validate(function (valid, rules) {
          if (valid) {
            let content = that.getUeditorContent()

            if (!content) {
              that.$message.error('请输入试题内容')
              return
            }

            let analysisContent = that.getAnalysisContent()

            that.form.content = content
            that.form.analysis = analysisContent
            that.form.summarize = that.getSummarizeContent()
            switch (that.form.questionType) {
              case 3:
              case 4:
              case 5:
              case 7:
                that.form.answer = that.getAnswerContent()
                break
              case 2: // 多选题
                if (that.answerList.length > 0) {
                  that.form.answer = ''
                  for (let i = 0; i < that.answerList.length; i++) {
                    that.form.answer += that.answerList[i] + ','
                  }

                  if (that.form.answer) {
                    that.form.answer = that.form.answer.substr(0, that.form.answer.length - 1)
                  }
                }
                break
            }

            if (that.form.answer === '' || that.form.answer === null) {
              that.$message.error('请输入试题答案')
              return
            }

            that.form.options = JSON.stringify(that.form.optionList)

            // 视频
            if (that.form.videoList) {
              let video = ''
              that.form.videoList.forEach(function (item) {
                video += item.url + ','
              })
              that.form.videoUrl = video
            }
            that.save(that)
          }
        })
      },

      save (that) {
        let params = this.form
        that.axios.post(that.$http.httpUrl('/system/question/saveOrUpdate'), params)
          .then(function (response) {
            if (response.data.code === 1) {
              if (!that.form.id) {
                that.$confirm(response.data.message + ',是否继续添加?', '提示', {
                  confirmButtonText: '继续添加',
                  cancelButtonText: '返回列表',
                  type: 'warning'
                }).then(() => {
                  that.clearForm(that)
                }).catch(() => {
                  that.activeName = 'questions_list'
                  that.labelName = '添加试题'
                  that.clearForm(that)
                  that.getQuestionList()
                })
              } else {
                that.$message({
                  type: 'success',
                  message: '修改成功'
                })
                that.activeName = 'questions_list'
                that.labelName = '添加试题'
                that.clearForm(that)
                that.getQuestionList()
              }
            }
          }).catch(function (error) {
            console.log(error)
          })
      },

      clearForm (that) {
        that.editor.setShow(true)
        that.editor.setContent('')
        that.answerEditor.setShow(true)
        that.answerEditor.setContent('')
        that.summarizeEditor.setShow(true)
        that.summarizeEditor.setContent('')
        that.analysisEditor.setShow(true)
        that.analysisEditor.setContent('')
        that.answerList = []
        that.form = {
          languagePointsInfoId: [],
          analysis: '',
          gradeInfoId: '',
          questionType: '',
          schoolType: '',
          subjectId: '',
          content: '',
          answer: '',
          videoList: [],
          options: '',
          optionList: [],
          summarize: ''
        }
      },

      // 获取文档内容
      getUeditorContent () {
        return this.editor.getContent()
      },

      // 获取试题解析内容
      getAnalysisContent () {
        return this.analysisEditor.getContent()
      },

      getAnswerContent () {
        return this.answerEditor.getContent()
      },

      getSummarizeContent () {
        return this.summarizeEditor.getContent()
      }
    },

    filters: {
      getQuestionTypeName (questionType) {
        for (let i = 0; i < thisPage.questionTypeList.length; i++) {
          if (thisPage.questionTypeList[i].code === questionType) {
            return thisPage.questionTypeList[i].value
          }
        }
        return '无'
      }
    }
  }
</script>
<style lang="scss">
  .el-tag {
    margin-left: 5px;
  }
  .mod-menu__icon-popover {
    width: 40%;
  }
  .edui-default .edui-editor-toolbarbox {
    position: relative !important;
  }

  .mod-demo-ueditor {
    position: relative;
    z-index: 510;
    > .el-alert {
      margin-bottom: 10px;
    }
  }
</style>
