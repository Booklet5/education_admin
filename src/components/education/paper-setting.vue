<template>
  <div>
    <el-dialog
      @closed="closePaperSetting"
      title="试卷设置"
      :close-on-click-modal="false"
      :visible.sync="paperSettingDialogVisible">
      <template>
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="考试限制" name="examLimit">
            <el-form  ref="form"  label-width="80px">
              <el-row>
                <el-col :span="24">
                  <el-form-item label="有效期限:" prop="name">
                    <template>
                      <el-select v-model="form.examType" placeholder="请选择">
                        <el-option
                          v-for="item in validTimeType"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value">
                        </el-option>
                      </el-select>

                      <div v-if="form.examType === 1" class="block" style="float: right; width: 65%">
                        <el-date-picker
                          v-model="examTimeSection"
                          type="datetimerange"
                          range-separator="至"
                          start-placeholder="开始日期"
                          end-placeholder="结束日期">
                        </el-date-picker>
                      </div>
                    </template>

                  </el-form-item>

                 <!-- <el-form-item prop="name">
                    <el-select v-model="form.validTimeType" placeholder="答卷次数">
                      <el-option
                        v-for="item in validTimeType"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                      </el-option>
                    </el-select>
                  </el-form-item>-->
                </el-col>
              </el-row>
            </el-form>
          </el-tab-pane>
          <el-tab-pane label="结果设置" name="first">
            <el-form  ref="form"  label-width="80px">
              <el-row>
                <el-col :span="24">
                  <el-form-item label="提交答卷" prop="name">
                    <template>
                      <el-radio v-model="form.commitAfterType" label="1">显示成绩</el-radio>
                      <el-radio v-model="form.commitAfterType" label="2">不显示成绩</el-radio>
                    </template>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row>
                <el-col :span="24">
                  <el-form-item label="显示名次" prop="name">
                    <el-switch
                      v-model="value"
                      active-color="#13ce66"
                      inactive-color="#ff4949">
                    </el-switch>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-tab-pane>
         <!-- <el-tab-pane label="阅卷设置" name="second">配置管理</el-tab-pane>
          <el-tab-pane label="防作弊设置" name="third">角色管理</el-tab-pane>-->
        </el-tabs>
      </template>

      <span slot="footer" class="dialog-footer">
        <el-button @click="closePaperSetting">取消</el-button>
        <el-button @click="savePaperSetting" type="primary">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'paper-setting',
    props: {
      showPaperSettingFlag: {
        type: Boolean,
        required: false,
        default: false
      },

      formData: {
        type: Object,
        required: false,
        default: {}
      }
    },

    watch: {
      showPaperSettingFlag (val) {
        this.paperSettingDialogVisible = val
      },

      formData (val) {
        this.form = val
      }
    },

    mounted () {
      if (this.formData.startTime && this.formData.endTime) {
        this.examTimeSection.push(this.moment(this.formData.startTime).format('YYYY-MM-DD HH:mm:ss'));
        this.examTimeSection.push(this.moment(this.formData.endTime).format('YYYY-MM-DD HH:mm:ss'));
      }
    },

    data () {
      return {
        paperSettingDialogVisible: false,
        activeName: 'examLimit',
        examTimeSection: [],
        form: {},
        validTimeType: [
          {
            label: '指定开放时间',
            value: 1
          },
          {
            label: '永久有效',
            value: 2
          }
        ]
      }
    },

    methods: {
      handleClick () {

      },

      closePaperSetting () {
        this.paperSettingDialogVisible = false
        this.$emit('closePaperSetting')
      },

      savePaperSetting () {

      }
    }
  }
</script>

<style scoped>

</style>
